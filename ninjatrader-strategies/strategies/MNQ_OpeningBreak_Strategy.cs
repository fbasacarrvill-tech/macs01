/*
 * MNQ Opening Break Strategy - Micro E-mini Nasdaq-100 Futures
 * Versión Corregida para NinjaTrader 8
 */

#region Using declarations
using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using NinjaTrader.Cbi;
using NinjaTrader.Gui;
using NinjaTrader.Gui.Tools;
using NinjaTrader.Data;
using NinjaTrader.Core.FloatingPoint;
using NinjaTrader.Core;
#endregion

namespace NinjaTrader.NinjaScript.Strategies
{
    public class MNQOpeningBreakStrategy : Strategy
    {
        // ===== PARÁMETROS DE CONFIGURACIÓN =====
        private int sessionStartHour = 9;
        private int sessionStartMinute = 30;
        private int sessionEndMinute = 60;

        // ===== PARÁMETROS DE INDICADORES =====
        private int fastEmaLength = 5;
        private int slowEmaLength = 13;
        private int stopLossPips = 20;
        private int takeProfitPips = 40;

        // ===== ESTADO =====
        private bool sessionOpen = false;

        protected override void OnStateChange()
        {
            if (State == State.SetDefaults)
            {
                Description = @"MNQ Opening Break Strategy (9:30-10:00 AM ET)";
                Name = "MNQ Opening Break Strategy";
                Calculate = Calculate.OnBarClose;
                EntriesPerDirection = 1;
                EntryHandling = EntryHandling.AllEntries;
                IsExitOnSessionCloseStrategy = true;
                ExitOnSessionCloseSeconds = 30;
                IsFillLimitOnTouch = false;
                OrderFillResolution = OrderFillResolution.Standard;
                Slippage = 2;
                TimeInForce = TimeInForce.Day;
                TraceOrders = false;
            }
            else if (State == State.Configure)
            {
                // Agregar series de datos de 1 minuto
                AddDataSeries(Data.BarsPeriodType.Minute, 1);
            }
            else if (State == State.DataLoaded)
            {
                // Estrategia lista
            }
        }

        protected override void OnBarUpdate()
        {
            // Solo operar en timeframe de 1 minuto
            if (BarsInProgress != 1)
                return;

            // Obtener hora actual
            DateTime currentTime = Time[0];
            int currentHour = currentTime.Hour;
            int currentMinute = currentTime.Minute;

            // Verificar si estamos en horario de sesión (9:30-10:00 AM ET)
            if (currentHour == sessionStartHour &&
                currentMinute >= sessionStartMinute &&
                currentMinute < sessionStartMinute + sessionEndMinute)
            {
                sessionOpen = true;
            }
            else
            {
                sessionOpen = false;

                // Cerrar posiciones fuera de sesión
                if (Position.MarketPosition != MarketPosition.Flat)
                {
                    ExitLong("ExitSession");
                    ExitShort("ExitSession");
                }
                return;
            }

            // Solo si hay datos suficientes
            if (CurrentBar < 20 || !sessionOpen)
                return;

            // Calcular valores de indicadores
            double close = Close[0];
            double ema5 = EMA(Close, fastEmaLength)[0];
            double ema13 = EMA(Close, slowEmaLength)[0];
            double volume = Volume[0];

            // Obtener máximo y mínimo de últimas 5 barras
            double high5 = High[0];
            double low5 = Low[0];
            for (int i = 1; i < 5 && i < CurrentBar; i++)
            {
                high5 = Math.Max(high5, High[i]);
                low5 = Math.Min(low5, Low[i]);
            }

            // LÓGICA DE ENTRADA ALCISTA
            if (Position.MarketPosition == MarketPosition.Flat &&
                close > high5 &&
                ema5 > ema13)
            {
                EnterLong("LongEntry");
            }

            // LÓGICA DE ENTRADA BAJISTA
            if (Position.MarketPosition == MarketPosition.Flat &&
                close < low5 &&
                ema5 < ema13)
            {
                EnterShort("ShortEntry");
            }

            // Gestión de Stop Loss y Take Profit
            if (Position.MarketPosition == MarketPosition.Long)
            {
                double entryPrice = Position.AveragePrice;
                double stopPrice = entryPrice - (stopLossPips * TickSize);
                double takePrice = entryPrice + (takeProfitPips * TickSize);

                if (close <= stopPrice)
                    ExitLong("StopLoss");
                else if (close >= takePrice)
                    ExitLong("TakeProfit");
            }

            if (Position.MarketPosition == MarketPosition.Short)
            {
                double entryPrice = Position.AveragePrice;
                double stopPrice = entryPrice + (stopLossPips * TickSize);
                double takePrice = entryPrice - (takeProfitPips * TickSize);

                if (close >= stopPrice)
                    ExitShort("StopLoss");
                else if (close <= takePrice)
                    ExitShort("TakeProfit");
            }

            // Cierre automático al final de la sesión
            if (currentMinute >= (sessionStartMinute + sessionEndMinute - 2))
            {
                if (Position.MarketPosition == MarketPosition.Long)
                    ExitLong("SessionClose");
                if (Position.MarketPosition == MarketPosition.Short)
                    ExitShort("SessionClose");
            }
        }

        // ===== PROPIEDADES PÚBLICAS =====
        [NinjaScriptProperty]
        [Range(3, 20)]
        [Display(Name = "Fast EMA", GroupName = "Parameters", Order = 1)]
        public int FastEmaLength
        {
            get { return fastEmaLength; }
            set { fastEmaLength = value; }
        }

        [NinjaScriptProperty]
        [Range(10, 30)]
        [Display(Name = "Slow EMA", GroupName = "Parameters", Order = 2)]
        public int SlowEmaLength
        {
            get { return slowEmaLength; }
            set { slowEmaLength = value; }
        }

        [NinjaScriptProperty]
        [Range(10, 50)]
        [Display(Name = "Stop Loss Pips", GroupName = "Risk", Order = 3)]
        public int StopLossPips
        {
            get { return stopLossPips; }
            set { stopLossPips = value; }
        }

        [NinjaScriptProperty]
        [Range(20, 100)]
        [Display(Name = "Take Profit Pips", GroupName = "Risk", Order = 4)]
        public int TakeProfitPips
        {
            get { return takeProfitPips; }
            set { takeProfitPips = value; }
        }
    }
}
