// Timestamps.js

// submit_date is a Date object, view_date defaults to current date.
export default function Timestamps(submit_date, view_date = new Date()) {

    // Validate submit_date
    if (!(submit_date instanceof Date) || isNaN(submit_date.getTime())) {
        console.warn("timestamp: invalid submit date:", submit_date);
        return "UNKNOWN";
    }

    const timeDiff = view_date - submit_date; // result in ms

    // If the submit date is in the future
    if (timeDiff < 0) {
        return "Item is created in the future!";
    }

    // Time conversions
    const sec2msec = 1000;
    const min2sec = 60;
    const hour2min = 60;
    const day2hour = 24;
    const year2day = 365;

    // Calculate thresholds in milliseconds
    const oneMinute = min2sec * sec2msec;
    const oneHour = hour2min * oneMinute;
    const oneDay = day2hour * oneHour;
    const oneMonth = 30 * oneDay;  // Approximate a month as 30 days
    const oneYear = year2day * oneDay;

    let ret;
    
    // Seconds
    if (timeDiff < oneMinute) {
        ret = Math.floor(timeDiff / sec2msec);
        return `${ret} seconds ago`;
    }

    // Minutes
    if (timeDiff < oneHour) {
        ret = Math.floor(timeDiff / oneMinute);
        return `${ret} minutes ago`;
    }

    // Hours
    if (timeDiff < oneDay) {
        ret = Math.floor(timeDiff / oneHour);
        return `${ret} hours ago`;
    }

    // Days
    if (timeDiff < oneMonth) {
        ret = Math.floor(timeDiff / oneDay);
        return `${ret} days ago`;
    }

    // Months
    if (timeDiff < oneYear) {
        ret = Math.floor(timeDiff / oneMonth);
        return `${ret} month(s) ago`;
    }

    // Years
    ret = Math.floor(timeDiff / oneYear);
    return `${ret} year(s) ago`;
}
