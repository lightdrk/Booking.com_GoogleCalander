# Booking.com_GoogleCalander
This script combined with booking.com_scraper (partner account ) creates google calendar events , reservation event,check-in and check-out with all the data like number, name, reservation id , property name etc.  
## Overview

The Booking.com Calendar Integration project allows you to synchronize booking data from Booking.com with Google Calendar, providing a seamless experience for managing reservations, check-ins, and check-outs.

## Features

- **Automatic Integration**: Booking data is automatically fetched and integrated into Google Calendar, ensuring real-time updates.
- **Color-Coded Events**: Events are color-coded for easy identification based on reservation status.
- **Detailed Information**: Each event contains detailed information about the reservation, including guest name, phone number, and property details.
- **Check-In and Check-Out**: Separate events for check-ins and check-outs make managing guest arrivals and departures straightforward.
- **Conflict Resolution**: If a reservation status changes or conflicts with an existing event, the system updates or removes events accordingly.
- **OAuth2 Authentication**: Secure OAuth2 authentication with Google Calendar API for data access.

## Getting Started

To get started with this project, follow these steps:

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/yourusername/booking-calendar-integration.git
Install project dependencies:

bash
Copy code
cd booking-calendar-integration
npm install
Configure OAuth2 Credentials:
Create a client_secret.json file with your Google Calendar API credentials.
download the client secret file in folder helpers. rename it as client_secret.json
Obtain OAuth2 tokens by running the project and following the authentication flow.

Run the integration script:

node GoogleCal.js

Enjoy automated calendar integration!

