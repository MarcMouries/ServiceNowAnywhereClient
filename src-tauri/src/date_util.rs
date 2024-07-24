use chrono::prelude::*;
use chrono::Datelike;
use chrono::Local;

pub fn get_formatted_date_time() -> String {
    let now = Local::now();

    format!(
        "{}, {} {}, {} {:02}:{:02} {}",
        now.format("%A"), // Full weekday name
        now.format("%B"), // Full month name
        now.day(),        // Day of the month
        now.format("%Y"), // Year
        now.format("%I"), // Hour in 12-hour format
        now.minute(),     // Minute
        if now.hour() < 12 { "AM" } else { "PM" } // AM/PM
    )
}
