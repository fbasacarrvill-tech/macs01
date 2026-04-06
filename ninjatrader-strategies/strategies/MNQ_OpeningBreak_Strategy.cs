/*
 * MNQ Opening Break Strategy - SIMPLIFIED FOR TESTING
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
        private int fastEmaLength = 5;
        private int slowEmaLength = 13;
        private int stopLossPips = 20;
        private int takeProfitPips = 40;
        private int sessionStartHour = 9;
        private int sessionStartMinute = 30;
        private int sessionDurationMinutes = 60;

        protected override void OnStateChange()
        {
            if (State == State.SetDefaults)
            {
                Description = @"MNQ Opening Break Strategy";
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

            // Obtener hora actual
            DateTime currentTime = Time[0];
            int currentHour = currentTime.Hour;
            int currentMinute = currentTime.Minute;

            // Calcular hora y minuto de fin
            int sessionEndHour = sessionStartHour;
            int sessionEndMinute = sessionStartMinute + sessionDurationMinutes;
            if (sessionEndMinute >= 60)
            {
                sessionEndHour += sessionEndMinute / 60;
                sessionEndMinute = sessionEndMinute % 60;
            }

            // Verificar si estamos en el horario de sesión configurado
            bool isSessionTime = false;
            if (currentHour == sessionStartHour && currentMinute >= sessionStartMinute)
            {
                if (sessionEndHour == sessionStartHour)
                {
                    // Misma hora
                    isSessionTime = (currentMinute < sessionEndMinute);
                }
                else
                {
                    // Diferentes horas
                    isSessionTime = true;
                }
            }
            else if (currentHour > sessionStartHour && currentHour < sessionEndHour)
            {
                isSessionTime = true;
            }
            else if (currentHour == sessionEndHour && currentMinute < sessionEndMinute)
            {
                isSessionTime = true;
            }

            if (!isSessionTime)
            {
                // Cerrar posiciones fuera de horario
                if (Position.MarketPosition == MarketPosition.Long)
                    ExitLong("SessionEnd");
                if (Position.MarketPosition == MarketPosition.Short)
                    ExitShort("SessionEnd");
                return;
            }

            // Necesita 20 barras mínimo
            if (CurrentBar < 20)
                return;

            // Obtener datos
            double close = Close[0];
            double open = Open[0];

            // EMA
            double ema5 = EMA(Close, fastEmaLength)[0];
            double ema13 = EMA(Close, slowEmaLength)[0];

            // ENTRADA LARGA: Si el precio está por encima de ambas EMAs
            if (Position.MarketPosition == MarketPosition.Flat)
            {
                if (close > ema5 && ema5 > ema13)
                {
                    EnterLong("Long");
                }
                // ENTRADA CORTA: Si el precio está por debajo de ambas EMAs
                else if (close < ema5 && ema5 < ema13)
                {
                    EnterShort("Short");
                }
            }

            // STOP LOSS Y TAKE PROFIT - POSICIÓN LARGA
            if (Position.MarketPosition == MarketPosition.Long)
            {
                double entryPrice = Position.AveragePrice;
                double currentPnL = close - entryPrice;
                double pnLInPips = currentPnL / TickSize;

                // Take Profit
                if (pnLInPips >= takeProfitPips)
                {
                    ExitLong("TP");
                }
                // Stop Loss
                else if (pnLInPips <= -stopLossPips)
                {
                    ExitLong("SL");
                }
            }

            // STOP LOSS Y TAKE PROFIT - POSICIÓN CORTA
            if (Position.MarketPosition == MarketPosition.Short)
            {
                double entryPrice = Position.AveragePrice;
                double currentPnL = entryPrice - close;
                double pnLInPips = currentPnL / TickSize;

                // Take Profit
                if (pnLInPips >= takeProfitPips)
                {
                    ExitShort("TP");
                }
                // Stop Loss
                else if (pnLInPips <= -stopLossPips)
                {
                    ExitShort("SL");
                }
            }
        }

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
        [Range(1, 480)]
        [Display(Name = "Session Duration Minutes", GroupName = "Session Time", Order = 7)]
        public int SessionDurationMinutes
        {
            get { return sessionDurationMinutes; }
            set { sessionDurationMinutes = value; }
        }
    }
}
