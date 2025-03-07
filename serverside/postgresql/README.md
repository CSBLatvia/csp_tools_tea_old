# Scripts to create PostgreSQL schema with tables and views and add data

Add functions [get_pretty_number](https://github.com/CSBLatvia/postgresql-common?tab=readme-ov-file#get_pretty_number) and [getbreaks_classes](https://github.com/CSBLatvia/postgresql-common?tab=readme-ov-file#getbreaks_classes) from [postgresql-common](https://github.com/CSBLatvia/postgresql-common) repository.

1. [role.sql](serverside/postgresql/role.sql) – to create users and roles (replace `password` with user password).
2. [tea.sql](serverside/postgresql/tea.sql) – to create the tea schema.
3. [create_tables.sql](serverside/postgresql/create_tables.sql) – to create tables.
4. [texts_title.sql](serverside/postgresql/texts_title.sql) – to create and populate a table that supplies data for titles, legends, and data tables.
5. [texts_pop.sql](serverside/postgresql/texts_pop.sql) – to create and populate a table that supplies data for pop-ups and information panel.
9. [update_data.sh](serverside/postgresql/update_data.sh) – a bash script to populate tea.data table with data published on [Open Data Portal of Latvia](https://data.gov.lv/dati/en/dataset/tea/resource/2f1793bd-099f-4da4-b54d-71766d0906e0) (`user` must be followed by the user name and `PGPASSWORD` by the user password).

Select contents of tea.translations in JSON format to be inserted in [translations.json](angular_client/src/assets/config/translations.json) (JSON must be formatted before insertion):

```sql
WITH c
AS (
  SELECT *
  FROM tea.translations
  ORDER BY variable_name
  )
SELECT json_object_agg(variable_name, json_build_array(lv, en, used, html)) AS result
FROM c;
```

# Functions

* [get_territory](serverside/postgresql/functions/get_territory.sql) – returns territory names for use in other functions.
* [get_menu_territories](serverside/postgresql/functions/get_menu_territories.sql) – returns territory names for the menu.
* [generate_text_menu](serverside/postgresql/functions/generate_text_menu.sql) – returns names of economic activities, occupations, and sectors.
* [generate_data_table](serverside/postgresql/functions/generate_data_table.sql) – returns the contents of the table in the panel.

For maps:

* [a_generate_map_viz](serverside/postgresql/functions/a_generate_map_viz.sql) – returns base data.
* [generate_text_title](serverside/postgresql/functions/generate_text_title.sql) – returns map titles. Uses helper function [generate_text_title_sub](serverside/postgresql/functions/generate_text_title_sub.sql).
* [generate_text_title_sub](serverside/postgresql/functions/generate_text_title_sub.sql) – the helper function used by [generate_text_title](serverside/postgresql/functions/generate_text_title.sql).
* [generate_text_pop](serverside/postgresql/functions/generate_text_pop.sql) – returns pop-up texts.
* [get_map_centroids](serverside/postgresql/functions/get_map_centroids.sql) – returns centroid coordinates of the territory polygons for placing the pie charts.
