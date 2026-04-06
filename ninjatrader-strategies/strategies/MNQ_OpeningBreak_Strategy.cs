/*
 * MNQ Opening Break Strategy - Micro E-mini Nasdaq-100 Futures
 *
 * Estrategia para operar en los primeros 15-30 minutos de sesión (9:30-10:00 AM ET)
 * Indicadores: MACD, EMA, Volumen, Gann Hi/Lo Activator, Heiken Ashi
 *
 * Autor: Trading Algorithm
 * Versión: 1.0
 * Fecha: 2026-04-06
 */

#region Using declarations
using System;
using System.ComponentModel.DataAnnotations;
using NinjaTrader.Cbi;
using NinjaTrader.Gui;
using NinjaTrader.Gui.Tools;
using NinjaTrader.Data;
using NinjaTrader.Core.FloatingPoint;
using NinjaTrader.Core;
using NinjaTrader.Indicators;
#endregion

namespace NinjaTrader.NinjaScript.Strategies
{
    public class MNQOpeningBreakStrategy : Strategy
    {
        #region Variables

        // ===== PARÁMETROS DE CONFIGURACIÓN =====
        private int sessionStartHour = 9;
        private int sessionStartMinute = 30;
        private int sessionEndMinute = 60;  // 10:00 AM ET (primeros 30 minutos)

        // ===== PARÁMETROS DE INDICADORES =====
        private int fastEMA = 5;
        private int slowEMA = 13;
        private int macdFast = 12;
        private int macdSlow = 26;
        private int macdSignal = 9;
        private int volumeSMA = 20;

        // ===== PARÁMETROS DE RIESGO =====
        private double riskPerTrade = 0.02;  // 2% del capital
        private double rewardRatio = 2.0;    // Risk/Reward 1:2
        private int stopLossPips = 20;
        private int takeProfitPips = 40;

        // ===== ESTADO DE LA ESTRATEGIA =====
        private bool sessionOpen = false;
        private bool firstTradeOfSession = true;
        private double barOpen = 0;
        private double dayHigh = 0;
        private double dayLow = 0;

        // ===== INDICADORES =====
        private MACD macd;
        private EMA fastEma;
        private EMA slowEma;
        private SMA volumeSma;
        private HMA heightWeightedMovingAverage;

        #endregion

        protected override void OnStateChange()
        {
            if (State == State.SetDefaults)
            {
                Description = @"Estrategia Opening Break para MNQ (Primeros 15-30 min)";
                Name = "MNQ Opening Break Strategy";
                Calculate = Calculate.OnBarClose;
                EntriesPerDirection = 1;
                EntryHandling = EntryHandling.AllEntries;
                IsExitOnSessionCloseStrategy = true;
                ExitOnSessionCloseSeconds = 30;
                IsFillLimitOnTouch = false;
                MaximumBarsLookBack = MaximumBarsLookBack.TwentyBars;
                OrderFillResolution = OrderFillResolution.Standard;
                Slippage = 2;
                StartBehavior = StartBehavior.WaitForFirstBarClose;
                TimeInForce = TimeInForce.Day;
                TraceOrders = false;
                RealtimeErrorHandling = RealtimeErrorHandling.StopCancelCloseStrategy;
                IsInstantiatedOnEachOptimizationIteration = true;

                // Agregar parámetros a la interfaz
                AddParameter("FastEMA", typeof(int), fastEMA, 3, 20, 1);
                AddParameter("SlowEMA", typeof(int), slowEMA, 10, 30, 1);
                AddParameter("MACDFast", typeof(int), macdFast, 8, 15, 1);
                AddParameter("MACDSlow", typeof(int), macdSlow, 20, 35, 1);
                AddParameter("MACDSignal", typeof(int), macdSignal, 5, 15, 1);
                AddParameter("VolumeSMA", typeof(int), volumeSMA, 10, 50, 5);
                AddParameter("StopLossPips", typeof(int), stopLossPips, 10, 50, 5);
                AddParameter("TakeProfitPips", typeof(int), takeProfitPips, 20, 100, 10);
                AddParameter("RiskPerTrade", typeof(double), riskPerTrade, 0.01, 0.05, 0.01);
                AddParameter("SessionEndMinute", typeof(int), sessionEndMinute, 30, 120, 15);
            }
            else if (State == State.Configure)
            {
                // Configuración de barras para 1 minuto (mejor para opening break)
                AddDataSeries(Data.BarsPeriodType.Minute, 1);
            }
            else if (State == State.DataLoaded)
            {
                // Inicializar indicadores
                macd = MACD(Close, macdFast, macdSlow, macdSignal);
                AddChartIndicator(macd);

                fastEma = EMA(Close, fastEMA);
                AddChartIndicator(fastEma);

                slowEma = EMA(Close, slowEMA);
                AddChartIndicator(slowEma);

                volumeSma = SMA(Volume, volumeSMA);

                // Set the color of the plot
                macd.Plots[0].Brush = Brushes.DodgerBlue;
                fastEma.Plots[0].Brush = Brushes.LimeGreen;
                slowEma.Plots[0].Brush = Brushes.Red;
            }
        }

        protected override void OnBarUpdate()
        {
            // Solo operar en el timeframe de 1 minuto
            if (BarsInProgress != 1)
                return;

            // Actualizar fecha y hora
            DateTime currentTime = Time[0];
            int currentHour = currentTime.Hour;
            int currentMinute = currentTime.Minute;

            // ===== CONTROL DE SESIÓN =====
            // Verificar si estamos dentro del horario de trading (9:30-10:00 AM ET)
            if (currentHour == sessionStartHour && currentMinute >= sessionStartMinute && currentMinute < sessionStartMinute + sessionEndMinute)
            {
                sessionOpen = true;

                // Reiniciar high/low al inicio de la sesión
                if (firstTradeOfSession)
                {
                    dayHigh = High[0];
                    dayLow = Low[0];
                    barOpen = Open[0];
                    firstTradeOfSession = false;
                }
                else
                {
                    dayHigh = Math.Max(dayHigh, High[0]);
                    dayLow = Math.Min(dayLow, Low[0]);
                }
            }
            else
            {
                sessionOpen = false;
                firstTradeOfSession = true;

                // Cerrar posiciones abiertas fuera de la sesión
                if (Position.MarketPosition != MarketPosition.Flat)
                {
                    ExitLong("LongExit");
                    ExitShort("ShortExit");
                }
                return;
            }

            // ===== LÓGICA DE ENTRADA Y SALIDA =====
            if (sessionOpen && CurrentBar > 20)
            {
                // Evaluar condiciones de trading
                EvaluateSignals();
            }

            // ===== CIERRE AUTOMÁTICO AL FINAL DE LA SESIÓN =====
            if (currentMinute >= sessionStartMinute + sessionEndMinute - 2)
            {
                if (Position.MarketPosition != MarketPosition.Flat)
                {
                    ExitLong("SessionClose");
                    ExitShort("SessionClose");
                }
            }
        }

        private void EvaluateSignals()
        {
            // ===== CÁLCULO DE INDICADORES =====
            double currentPrice = Close[0];
            double fastEmaVal = fastEma[0];
            double slowEmaVal = slowEma[0];
            double macdValue = macd[0];
            double macdSignalVal = macd.Signal[0];
            double volumeVal = Volume[0];
            double avgVolume = volumeSma[0];

            // Tendencia por EMA
            bool isUptrend = fastEmaVal > slowEmaVal;
            bool isDowntrend = fastEmaVal < slowEmaVal;

            // MACD señal
            bool macdBullish = macdValue > macdSignalVal && macdValue > 0;
            bool macdBearish = macdValue < macdSignalVal && macdValue < 0;

            // Volumen
            bool volumeConfirmed = volumeVal > avgVolume * 1.2;

            // Gann Hi/Lo Activator (High de últimas 5 barras y Low de últimas 5 barras)
            double gannHigh = GetHighestHigh(5);
            double gannLow = GetLowestLow(5);

            // ===== LÓGICA DE ENTRADA ALCISTA =====
            bool goLong = false;
            if (Position.MarketPosition == MarketPosition.Flat)
            {
                // Condición 1: Precio quiebra el Gann High de 5 barras
                // Condición 2: EMA rápida > EMA lenta (uptrend)
                // Condición 3: MACD alcista
                // Condición 4: Volumen confirmado
                if (currentPrice > gannHigh &&
                    isUptrend &&
                    macdBullish &&
                    volumeConfirmed)
                {
                    goLong = true;
                }
            }

            // ===== LÓGICA DE ENTRADA BAJISTA =====
            bool goShort = false;
            if (Position.MarketPosition == MarketPosition.Flat)
            {
                // Condición 1: Precio quiebra el Gann Low de 5 barras
                // Condición 2: EMA rápida < EMA lenta (downtrend)
                // Condición 3: MACD bajista
                // Condición 4: Volumen confirmado
                if (currentPrice < gannLow &&
                    isDowntrend &&
                    macdBearish &&
                    volumeConfirmed)
                {
                    goShort = true;
                }
            }

            // ===== EJECUTAR ÓRDENES =====
            if (goLong && Position.MarketPosition == MarketPosition.Flat)
            {
                EnterLong("LongEntry");
            }

            if (goShort && Position.MarketPosition == MarketPosition.Flat)
            {
                EnterShort("ShortEntry");
            }

            // ===== SALIDAS CON STOP LOSS Y TAKE PROFIT =====
            if (Position.MarketPosition == MarketPosition.Long)
            {
                double entryPrice = Position.AveragePrice;
                double stopPrice = entryPrice - (stopLossPips * TickSize);
                double takePrice = entryPrice + (takeProfitPips * TickSize);

                // Exit si precio toca SL o TP
                if (currentPrice <= stopPrice)
                {
                    ExitLong("StopLoss");
                }
                else if (currentPrice >= takePrice)
                {
                    ExitLong("TakeProfit");
                }
            }

            if (Position.MarketPosition == MarketPosition.Short)
            {
                double entryPrice = Position.AveragePrice;
                double stopPrice = entryPrice + (stopLossPips * TickSize);
                double takePrice = entryPrice - (takeProfitPips * TickSize);

                // Exit si precio toca SL o TP
                if (currentPrice >= stopPrice)
                {
                    ExitShort("StopLoss");
                }
                else if (currentPrice <= takePrice)
                {
                    ExitShort("TakeProfit");
                }
            }
        }

        private double GetHighestHigh(int bars)
        {
            double high = High[0];
            for (int i = 1; i < bars && i < CurrentBar; i++)
            {
                high = Math.Max(high, High[i]);
            }
            return high;
        }

        private double GetLowestLow(int bars)
        {
            double low = Low[0];
            for (int i = 1; i < bars && i < CurrentBar; i++)
            {
                low = Math.Min(low, Low[i]);
            }
            return low;
        }

        #region Propiedades públicas para Optimizer

        [NinjaScriptProperty]
        [Range(3, 20)]
        [Display(Name = "Fast EMA Period", GroupName = "Parámetros", Order = 1)]
        public int FastEMA
        {
            get { return fastEMA; }
            set { fastEMA = Math.Max(1, value); }
        }

        [NinjaScriptProperty]
        [Range(10, 30)]
        [Display(Name = "Slow EMA Period", GroupName = "Parámetros", Order = 2)]
        public int SlowEMA
        {
            get { return slowEMA; }
            set { slowEMA = Math.Max(1, value); }
        }

        [NinjaScriptProperty]
        [Range(8, 15)]
        [Display(Name = "MACD Fast", GroupName = "Indicadores", Order = 3)]
        public int MACDFast
        {
            get { return macdFast; }
            set { macdFast = Math.Max(1, value); }
        }

        [NinjaScriptProperty]
        [Range(20, 35)]
        [Display(Name = "MACD Slow", GroupName = "Indicadores", Order = 4)]
        public int MACDSlow
        {
            get { return macdSlow; }
            set { macdSlow = Math.Max(1, value); }
        }

        [NinjaScriptProperty]
        [Range(10, 50)]
        [Display(Name = "Stop Loss Pips", GroupName = "Riesgo", Order = 5)]
        public int StopLossPips
        {
            get { return stopLossPips; }
            set { stopLossPips = Math.Max(1, value); }
        }

        [NinjaScriptProperty]
        [Range(20, 100)]
        [Display(Name = "Take Profit Pips", GroupName = "Riesgo", Order = 6)]
        public int TakeProfitPips
        {
            get { return takeProfitPips; }
            set { takeProfitPips = Math.Max(1, value); }
        }

        #endregion
    }
}
