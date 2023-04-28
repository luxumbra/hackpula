import { useEffect, useState } from "react";
import { DateTime } from "luxon";

export type CountdownType = {
	years: number;
	months: number;
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
};

export type CountdownReturnType = CountdownType & {
	isLoading: boolean;
};

export const useCountdown = (targetDate: string): CountdownReturnType => {
	const countdownDate = DateTime.fromISO(targetDate);
	const now = DateTime.local();
	const [isLoading, setIsLoading] = useState(true);
	const diff = countdownDate.diff(now, [
		"years",
		"months",
		"days",
		"hours",
		"minutes",
		"seconds",
	])

	const roundedDiff: CountdownType = {
		years: Math.round(diff.years),
		months: Math.round(diff.months),
		days: Math.round(diff.days),
		hours: Math.round(diff.hours),
		minutes: Math.round(diff.minutes),
		seconds: Math.round(diff.seconds),
	}

	const [countdown, setCountdown] = useState<CountdownType>(roundedDiff);

	useEffect(() => {
		const interval = setInterval(() => {
			const rightNow = DateTime.local();
			const newDiff = countdownDate.diff(rightNow, [
				"years",
				"months",
				"days",
				"hours",
				"minutes",
				"seconds",
			]);

			const newRoundedDiff: CountdownType = {
				years: Math.round(newDiff.years),
				months: Math.round(newDiff.months),
				days: Math.round(newDiff.days),
				hours: Math.round(newDiff.hours),
				minutes: Math.round(newDiff.minutes),
				seconds: Math.round(newDiff.seconds),
			}
			setCountdown(newRoundedDiff);
		}, 1000);

		return () => clearInterval(interval);
	}, [countdownDate]);
	// countdown.days ? setIsLoading(false) : setIsLoading(true);
	return {
		...getReturnValues(countdown),
		isLoading,
	};
}

const getReturnValues = (values): CountdownType => {
	const { years, months, days, hours, minutes, seconds } = values;
	return {
		years,
		months,
		days,
		hours,
		minutes,
		seconds,
	};
};
