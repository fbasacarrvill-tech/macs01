/*
 * PROFESSIONAL ORB (Opening Range Breakout) Strategy
 * For MNQ - Micro E-mini Nasdaq-100 Futures
 * NinjaTrader 8 Compatible
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
        private int stopLossPips = 25;             // Stop Loss (Risk)
        private int takeProfitPips = 75;           // Take Profit (Reward = 3x risk)

        // ===== SESSION PARAMETERS =====
        private int sessionStartHour = 9;
        private int sessionStartMinute = 30;
        private int sessionEndHour = 16;
        private int sessionEndMinute = 0;

        // ===== INTERNAL STATE =====
        private double orbHigh = 0;
        private double orbLow = 0;
        private bool orbCalculated = false;
        private DateTime orbStartTime;
        private int orbBarCount = 0;

        protected override void OnStateChange()
        {
            if (State == State.SetDefaults)
            {
                Description = @"Professional ORB Strategy - Opening Range Breakout";
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
                AddDataSeries(Data.BarsPeriodType.Minute, 1);
            }
        }

        protected override void OnBarUpdate()
        {
            // Solo operar en timeframe de 1 minuto
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

            // Cierre automático al final de sesión
            if (!inSession && Position.MarketPosition != MarketPosition.Flat)
            {
                ExitLong("SessionEnd");
                ExitShort("SessionEnd");
                orbCalculated = false;
            }

            if (!inSession)
                return;

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

            // ===== ESPERAR RUPTURA DEL ORB =====
            if (orbCalculated && CurrentBar > 20)
            {
                double bullishBreakpoint = orbHigh + (breakoutConfirmPips * TickSize);
                double bearishBreakpoint = orbLow - (breakoutConfirmPips * TickSize);

                // ENTRADA LARGA: Precio rompe por encima del ORB High
                if (Position.MarketPosition == MarketPosition.Flat && close > bullishBreakpoint)
                {
                    EnterLong("ORB_Long");
                }

                // ENTRADA CORTA: Precio rompe por debajo del ORB Low
                if (Position.MarketPosition == MarketPosition.Flat && close < bearishBreakpoint)
                {
                    EnterShort("ORB_Short");
                }
            }

            // ===== GESTIÓN DE POSICIONES =====
            if (Position.MarketPosition == MarketPosition.Long)
            {
                double entryPrice = Position.AveragePrice;
                double currentPnL = (close - entryPrice) / TickSize;

                // Take Profit
                if (currentPnL >= takeProfitPips)
                {
                    ExitLong("TP");
                }
                // Stop Loss
                else if (currentPnL <= -stopLossPips)
                {
                    ExitLong("SL");
                }
            }

            if (Position.MarketPosition == MarketPosition.Short)
            {
                double entryPrice = Position.AveragePrice;
                double currentPnL = (entryPrice - close) / TickSize;

                // Take Profit
                if (currentPnL >= takeProfitPips)
                {
                    ExitShort("TP");
                }
                // Stop Loss
                else if (currentPnL <= -stopLossPips)
                {
                    ExitShort("SL");
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
        [Range(10, 100)]
        [Display(Name = "Stop Loss Pips", GroupName = "Risk Management", Order = 3)]
        public int StopLossPips
        {
            get { return stopLossPips; }
            set { stopLossPips = value; }
        }

        [NinjaScriptProperty]
        [Range(20, 300)]
        [Display(Name = "Take Profit Pips", GroupName = "Risk Management", Order = 4)]
        public int TakeProfitPips
        {
            get { return takeProfitPips; }
            set { takeProfitPips = value; }
        }

        [NinjaScriptProperty]
        [Range(0, 23)]
        [Display(Name = "Session Start Hour", GroupName = "Session Time", Order = 5)]
        public int SessionStartHour
        {
            get { return sessionStartHour; }
            set { sessionStartHour = value; }
        }

        [NinjaScriptProperty]
        [Range(0, 59)]
        [Display(Name = "Session Start Minute", GroupName = "Session Time", Order = 6)]
        public int SessionStartMinute
        {
            get { return sessionStartMinute; }
            set { sessionStartMinute = value; }
        }

        [NinjaScriptProperty]
        [Range(0, 23)]
        [Display(Name = "Session End Hour", GroupName = "Session Time", Order = 7)]
        public int SessionEndHour
        {
            get { return sessionEndHour; }
            set { sessionEndHour = value; }
        }

        [NinjaScriptProperty]
        [Range(0, 59)]
        [Display(Name = "Session End Minute", GroupName = "Session Time", Order = 8)]
        public int SessionEndMinute
        {
            get { return sessionEndMinute; }
            set { sessionEndMinute = value; }
        }
    }
}
