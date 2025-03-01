# Server-side API Documentation

## Overview
This documentation describes the available API endpoints for the server-side PHP application. The API provides various endpoints for retrieving map data, translations, menu information, and visualization data.

## API Endpoints

All requests should be made to the base URL with a GET parameter `db` specifying the endpoint.

Example: `GET /?db=translations`

### Available Endpoints

1. **translations**
    - Description: Retrieves translation data
    - Method: GET
    - Required Parameters:
        - `db=translations`

2. **menu-years**
    - Description: Retrieves available years for data selection
    - Method: GET
    - Required Parameters:
        - `db=menu-years`

3. **menu-territories**
    - Description: Retrieves territory information
    - Method: GET
    - Required Parameters:
        - `db=menu-territories`

4. **menu-territory-name**
    - Description: Retrieves territory name information
    - Method: GET
    - Required Parameters:
        - `db=menu-territory-name`
        - `code` (string): Territory code
        - `level` (string): Territory level
        - `year` (number): Year for the data

5. **menu-profs**
    - Description: Retrieves profession menu data
    - Method: GET
    - Required Parameters:
        - `db=menu-profs`

6. **menu-naces**
    - Description: Retrieves industry (NACE) menu data
    - Method: GET
    - Required Parameters:
        - `db=menu-naces`

7. **menu-sectors**
    - Description: Retrieves sector menu data
    - Method: GET
    - Required Parameters:
        - `db=menu-sectors`

8. **viz-circles**
    - Description: Retrieves circle visualization data
    - Method: GET
    - Required Parameters:
        - `db=viz-circles`
        - `m1` (string): First parameter (w/h)
        - `m2` (string): Second parameter (e/av/vp)
        - `t1` (string): Territory level (3/4/7)
        - `year` (number): Year for the data

9. **viz-circles-region**
    - Description: Retrieves circle visualization data for a specific region
    - Method: GET
    - Required Parameters:
        - `db=viz-circles-region`
        - `m1` (string): First parameter (w/h)
        - `m2` (string): Second parameter (e/av/vp)
        - `t1` (string): Territory level (3/4/7)
        - `t2` (string): Territory code
        - `year` (number): Year for the data

10. **viz-circles-sectors**
    - Description: Retrieves circle visualization data with sector breakdown
    - Method: GET
    - Required Parameters:
        - `db=viz-circles-sectors`
        - `m1` (string): First parameter (w/h)
        - `m2` (string): Second parameter (e/av/vp)
        - `t1` (string): Territory level (3/4/7)
        - `m3` (string): Third parameter (i/p/s)
        - `m4` (string): Fourth parameter
        - `year` (number): Year for the data

11. **viz-circles-sectors-region**
    - Description: Retrieves circle visualization data with sector breakdown for a specific region
    - Method: GET
    - Required Parameters:
        - `db=viz-circles-sectors-region`
        - Similar parameters to viz-circles-sectors plus t2 (territory code)

12. **map-centroids**
    - Description: Retrieves map centroid data
    - Method: GET
    - Required Parameters:
        - `db=map-centroids`
        - `level` (string): Territory level (3/4/7)

13. **pop**
    - Description: Retrieves popup text data
    - Method: GET
    - Required Parameters:
        - `db=pop`

14. **title**
    - Description: Retrieves title text data
    - Method: GET
    - Required Parameters:
        - `db=title`

15. **meta-client**
    - Description: Retrieves metadata for client
    - Method: GET
    - Required Parameters:
        - `db=meta-client`

16. **data-table-list**
    - Description: Retrieves data for table display and export
    - Method: GET
    - Required Parameters:
        - `db=data-table-list`
        - Additional parameters based on visualization type

## Request Format

All requests should be made using HTTP GET method with the appropriate parameters.

### Common Parameters
Most visualization-related endpoints share these common parameters:
- `m1`: First parameter (w/h) - workplace or place-of-residence
- `m2`: Second parameter (e/av/vp) - number-of-employees, added-value, or value-produced
- `t1`: Territory level (3/4/7)
- `year`: Year for the data

## Response Format

The API returns data in JSON format. If an error occurs, the response will include an error status code and message.

### Success Response
```json
{
    "data": [...],
    "info": "ok"
}
```

### Error Response
```json
{
    "data": [],
    "info": "error",
    "error_info": "Error message description"
}
```


### Prerequisites
- PHP 7.4 or later
- postgresql database
- Nginx server

## Notes
- All endpoints are accessed through GET requests
- Responses are in JSON format
- Invalid or missing parameters will return appropriate error codes
- The API is designed to support map visualizations and multilingual content
