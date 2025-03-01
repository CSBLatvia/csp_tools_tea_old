# CSP Tools TEA

This repository contains the codebase for the TEA application, an older version of https://tools.csb.gov.lv/tea/.

## Project Overview

TEA is an interactive data visualization application that provides economic analysis tools with support for multiple languages (Latvian and English). The application allows users to explore economic data through various visualization types and parameters.

## Project Structure

The project is divided into two main components:

- **Angular Client**: Frontend application built with Angular 16.2.12 and Clarity Design System
- **Server Side**: Backend services built with PHP

## Components

### Client Side

The Angular client provides the user interface for the application with features including:

- Interactive map visualizations with multiple view types
- Multi-language support (LV/EN)
- Data filtering by year, territory level, and other parameters
- Data export capabilities
- Responsive design for both desktop and mobile

For detailed documentation including application routes, visualization system, and build instructions, see [angular_client/README.md](angular_client/README.md).

### Server Side

The PHP service provides API endpoints for the Angular client, handling:

- Data retrieval for visualizations
- Territory and region information
- Translation data
- Menu structure and options
- Metadata and configuration

For detailed API documentation including available endpoints, request formats, and response structures, see [serverside/README.md](serverside/README.md).

## Getting Started

To set up the complete application:

1. Set up the server-side component following the instructions in [serverside/README.md](serverside/README.md)
2. Set up the client-side component following the instructions in [angular_client/README.md](angular_client/README.md)
3. Configure the client to connect to the server by updating the configuration files as needed

## Technical Stack

- **Frontend**: Angular 16.2.12, Clarity Design System 16.2.0, ngx-slider-v2 16.0.2
- **Backend**: PHP 7.4, PostgreSQL
- **Infrastructure**: Web server (Nginx)

