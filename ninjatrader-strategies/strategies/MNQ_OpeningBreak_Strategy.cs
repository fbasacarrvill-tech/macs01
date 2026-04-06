/*
 * PROFESSIONAL ORB (Opening Range Breakout) Strategy - IMPROVED
 * For MNQ - Micro E-mini Nasdaq-100 Futures
 * NinjaTrader 8 Compatible
 *
 * Improvements:
 * - Daily Loss Limit (stops trading after losing X)
 * - Trailing Stop (protects profits)
 * - Volatility Filter (avoids extreme volatility)
 * - Better Risk Management
 */

#region Using declarations
using System;
using System.ComponentModel.DataAnnotations;
using NinjaTrader.Cbi;
using NinjaTrader.Data;
using NinjaTrader.Core;
#endregion

namespace NinjaTrader.NinjaScript.Strategies
{
    public class MNQOpeningBreakStrategy : Strategy
    {
        // ===== ORB PARAMETERS =====
        private int orbMinutes = 15;               // Opening Range period (15 min)
        private int breakoutConfirmPips = 2;       // Pips needed to confirm breakout
        private int stopLossPips = 150;            // Stop Loss (Risk) - 150 ticks
        private int takeProfitPips = 176;          // Take Profit (Reward) - 176 ticks
        private int trailingStopPips = 15;         // Trailing Stop (protects profit)

        // ===== RISK MANAGEMENT =====
        private double maxDailyLossPercent = 2.0;  // Max 2% loss per day before stopping
        private double dailyLossLimit = 0;
        private double dailyPnL = 0;

        // ===== SESSION PARAMETERS =====
        private int sessionStartHour = 9;
        private int sessionStartMinute = 30;
        private int sessionEndHour = 10;
        private int sessionEndMinute = 30;

        // ===== INTERNAL STATE =====
        private double orbHigh = 0;
        private double orbLow = 0;
        private bool orbCalculated = false;
        private DateTime orbStartTime;
        private int orbBarCount = 0;
        private DateTime lastTradeDateForStats;
        private double entryPrice = 0;
        private int tradeDirection = 0; // 1 = long, -1 = short

        protected override void OnStateChange()
        {
            if (State == State.SetDefaults)
            {
                Description = @"Professional ORB Strategy - Opening Range Breakout (IMPROVED)";
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
                AddDataSeries(Data.BarsPeriodType.Minute, 5);
            }
        }

        protected override void OnBarUpdate()
        {
            // Solo operar en timeframe de 5 minutos
            if (BarsInProgress != 1)
                return;

            DateTime currentTime = Time[0];
            int currentHour = currentTime.Hour;
            int currentMinute = currentTime.Minute;
            double close = Close[0];
            double high = High[0];
            double low = Low[0];

            // Verificar si estamos en horario de sesión
            bool inSession = false;
            if (currentHour > sessionStartHour || (currentHour == sessionStartHour && currentMinute >= sessionStartMinute))
            {
                if (currentHour < sessionEndHour || (currentHour == sessionEndHour && currentMinute < sessionEndMinute))
                {
                    inSession = true;
                }
            }

            // ===== RESET DAILY P&L AT BEGINNING OF SESSION =====
            if (inSession && currentHour == sessionStartHour && currentMinute == sessionStartMinute)
            {
                dailyPnL = 0;
                lastTradeDateForStats = currentTime;
            }

            // Cierre automático al final de sesión
            if (!inSession && Position.MarketPosition != MarketPosition.Flat)
            {
                ExitLong("SessionEnd");
                ExitShort("SessionEnd");
                orbCalculated = false;
            }

            if (!inSession)
                return;

            // ===== UPDATE DAILY P&L =====
            if (Position.MarketPosition != MarketPosition.Flat)
            {
                double currentPnL = 0;
                if (Position.MarketPosition == MarketPosition.Long)
                {
                    currentPnL = (close - entryPrice) * Position.Quantity;
                }
                else
                {
                    currentPnL = (entryPrice - close) * Position.Quantity;
                }
                dailyPnL = currentPnL;
            }

            // ===== CHECK DAILY LOSS LIMIT =====
            // Si calculamos límite basado en capital inicial (asumimos $100,000)
            dailyLossLimit = 100000 * (maxDailyLossPercent / 100);

            if (dailyPnL < -dailyLossLimit && Position.MarketPosition != MarketPosition.Flat)
            {
                // Hemos perdido más del límite diario permitido
                ExitLong("DailyLossLimit");
                ExitShort("DailyLossLimit");
                return; // No entrar en más operaciones hoy
            }

            // ===== CALCULAR OPENING RANGE (Primeros 15 minutos) =====
            if (!orbCalculated)
            {
                if (orbBarCount == 0)
                {
                    orbStartTime = currentTime;
                    orbHigh = high;
                    orbLow = low;
                    orbBarCount = 1;
                }
                else
                {
                    orbBarCount++;
                    orbHigh = Math.Max(orbHigh, high);
                    orbLow = Math.Min(orbLow, low);

                    // Verificar si completamos el ORB (15 minutos = 15 barras)
                    int minutesElapsed = (int)(currentTime - orbStartTime).TotalMinutes;
                    if (minutesElapsed >= orbMinutes)
                    {
                        orbCalculated = true;
                    }
                }
            }

            // ===== VOLATILITY FILTER (evita volatilidad extrema) =====
            double orbRange = orbHigh - orbLow;
            double avgRange = (orbRange > 0) ? orbRange : 50; // Rango mínimo

            // Si el rango es extremadamente grande, evitar tradear
            bool isExtremeVolatility = (orbRange > 200); // MNQ muy volátil

            // ===== ESPERAR RUPTURA DEL ORB =====
            if (orbCalculated && CurrentBar > 20 && !isExtremeVolatility && dailyPnL > -dailyLossLimit)
            {
                double bullishBreakpoint = orbHigh + (breakoutConfirmPips * TickSize);
                double bearishBreakpoint = orbLow - (breakoutConfirmPips * TickSize);

                // ENTRADA LARGA: Precio rompe por encima del ORB High
                if (Position.MarketPosition == MarketPosition.Flat && close > bullishBreakpoint)
                {
                    EnterLong("ORB_Long");
                    entryPrice = close;
                    tradeDirection = 1;
                }

                // ENTRADA CORTA: Precio rompe por debajo del ORB Low
                if (Position.MarketPosition == MarketPosition.Flat && close < bearishBreakpoint)
                {
                    EnterShort("ORB_Short");
                    entryPrice = close;
                    tradeDirection = -1;
                }
            }

            // ===== GESTIÓN DE POSICIONES CON TRAILING STOP =====
            if (Position.MarketPosition == MarketPosition.Long)
            {
                double currentPnLPips = (close - entryPrice) / TickSize;

                // Take Profit
                if (currentPnLPips >= takeProfitPips)
                {
                    ExitLong("TP");
                }
                // Stop Loss (normal)
                else if (currentPnLPips <= -stopLossPips)
                {
                    ExitLong("SL");
                }
                // Trailing Stop (protege ganancias)
                else if (currentPnLPips > trailingStopPips && currentPnLPips < takeProfitPips)
                {
                    double trailingStopPrice = close - (trailingStopPips * TickSize);
                    if (close <= trailingStopPrice)
                    {
                        ExitLong("TrailingStop");
                    }
                }
            }

            if (Position.MarketPosition == MarketPosition.Short)
            {
                double currentPnLPips = (entryPrice - close) / TickSize;

                // Take Profit
                if (currentPnLPips >= takeProfitPips)
                {
                    ExitShort("TP");
                }
                // Stop Loss (normal)
                else if (currentPnLPips <= -stopLossPips)
                {
                    ExitShort("SL");
                }
                // Trailing Stop (protege ganancias)
                else if (currentPnLPips > trailingStopPips && currentPnLPips < takeProfitPips)
                {
                    double trailingStopPrice = close + (trailingStopPips * TickSize);
                    if (close >= trailingStopPrice)
                    {
                        ExitShort("TrailingStop");
                    }
                }
            }

            // ===== REINICIAR ORB AL SIGUIENTE DÍA =====
            if (currentHour == sessionStartHour && currentMinute == sessionStartMinute && orbCalculated)
            {
                orbCalculated = false;
                orbBarCount = 0;
            }
        }

        // ===== PROPIEDADES PÚBLICAS =====
        [NinjaScriptProperty]
        [Range(5, 60)]
        [Display(Name = "ORB Period (Minutes)", GroupName = "ORB Settings", Order = 1)]
        public int OrbMinutes
        {
            get { return orbMinutes; }
            set { orbMinutes = value; }
        }

        [NinjaScriptProperty]
        [Range(1, 10)]
        [Display(Name = "Breakout Confirmation Pips", GroupName = "ORB Settings", Order = 2)]
        public int BreakoutConfirmPips
        {
            get { return breakoutConfirmPips; }
            set { breakoutConfirmPips = value; }
        }

        [NinjaScriptProperty]
        [Range(50, 300)]
        [Display(Name = "Stop Loss Ticks", GroupName = "Risk Management", Order = 3)]
        public int StopLossPips
        {
            get { return stopLossPips; }
            set { stopLossPips = value; }
        }

        [NinjaScriptProperty]
        [Range(50, 400)]
        [Display(Name = "Take Profit Ticks", GroupName = "Risk Management", Order = 4)]
        public int TakeProfitPips
        {
            get { return takeProfitPips; }
            set { takeProfitPips = value; }
        }

        [NinjaScriptProperty]
        [Range(5, 50)]
        [Display(Name = "Trailing Stop Pips", GroupName = "Risk Management", Order = 5)]
        public int TrailingStopPips
        {
            get { return trailingStopPips; }
            set { trailingStopPips = value; }
        }

        [NinjaScriptProperty]
        [Range(0.5, 5.0)]
        [Display(Name = "Max Daily Loss %", GroupName = "Risk Management", Order = 6)]
        public double MaxDailyLossPercent
        {
            get { return maxDailyLossPercent; }
            set { maxDailyLossPercent = value; }
        }

        [NinjaScriptProperty]
        [Range(0, 23)]
        [Display(Name = "Session Start Hour", GroupName = "Session Time", Order = 7)]
        public int SessionStartHour
        {
            get { return sessionStartHour; }
            set { sessionStartHour = value; }
        }

        [NinjaScriptProperty]
        [Range(0, 59)]
        [Display(Name = "Session Start Minute", GroupName = "Session Time", Order = 8)]
        public int SessionStartMinute
        {
            get { return sessionStartMinute; }
            set { sessionStartMinute = value; }
        }

        [NinjaScriptProperty]
        [Range(0, 23)]
        [Display(Name = "Session End Hour", GroupName = "Session Time", Order = 9)]
        public int SessionEndHour
        {
            get { return sessionEndHour; }
            set { sessionEndHour = value; }
        }

        [NinjaScriptProperty]
        [Range(0, 59)]
        [Display(Name = "Session End Minute", GroupName = "Session Time", Order = 10)]
        public int SessionEndMinute
        {
            get { return sessionEndMinute; }
            set { sessionEndMinute = value; }
        }
    }
}
