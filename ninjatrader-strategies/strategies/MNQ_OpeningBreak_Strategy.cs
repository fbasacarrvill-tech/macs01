/*
 * MNQ Opening Break Strategy - Micro E-mini Nasdaq-100 Futures
 * Simple Version - NinjaTrader 8 Compatible
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
                AddDataSeries(Data.BarsPeriodType.Minute, 1);
            }
        }

        protected override void OnBarUpdate()
        {
            if (BarsInProgress != 1)
                return;

            DateTime currentTime = Time[0];
            int currentHour = currentTime.Hour;
            int currentMinute = currentTime.Minute;

            // Session control: 9:30-10:00 AM ET
            if (currentHour == 9 && currentMinute >= 30 && currentMinute < 90)
            {
                sessionOpen = true;
            }
            else
            {
                sessionOpen = false;
                if (Position.MarketPosition != MarketPosition.Flat)
                {
                    ExitLong("SessionEnd");
                    ExitShort("SessionEnd");
                }
                return;
            }

            if (CurrentBar < 20 || !sessionOpen)
                return;

            double close = Close[0];
            double ema5 = EMA(Close, fastEmaLength)[0];
            double ema13 = EMA(Close, slowEmaLength)[0];

            // Get High/Low of last 5 bars
            double high5 = High[0];
            double low5 = Low[0];
            for (int i = 1; i < 5 && i < CurrentBar; i++)
            {
                high5 = Math.Max(high5, High[i]);
                low5 = Math.Min(low5, Low[i]);
            }

            // Long Entry
            if (Position.MarketPosition == MarketPosition.Flat && close > high5 && ema5 > ema13)
            {
                EnterLong("Long");
            }

            // Short Entry
            if (Position.MarketPosition == MarketPosition.Flat && close < low5 && ema5 < ema13)
            {
                EnterShort("Short");
            }

            // Stop Loss and Take Profit
            if (Position.MarketPosition == MarketPosition.Long)
            {
                double entryPrice = Position.AveragePrice;
                if (close <= entryPrice - (stopLossPips * TickSize))
                    ExitLong("SL");
                if (close >= entryPrice + (takeProfitPips * TickSize))
                    ExitLong("TP");
            }

            if (Position.MarketPosition == MarketPosition.Short)
            {
                double entryPrice = Position.AveragePrice;
                if (close >= entryPrice + (stopLossPips * TickSize))
                    ExitShort("SL");
                if (close <= entryPrice - (takeProfitPips * TickSize))
                    ExitShort("TP");
            }

            // Close at end of session
            if (currentMinute >= 58)
            {
                if (Position.MarketPosition == MarketPosition.Long)
                    ExitLong("Close");
                if (Position.MarketPosition == MarketPosition.Short)
                    ExitShort("Close");
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
    }
}
