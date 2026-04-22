**Name: Shuto Nakayasu**  
**Banner ID: B00961731**  
**CSCI 4166 Visualization**  
**9 April 2026**

# CSCI 4166 Project - Historical Artworks Visualization System

## Overview

A visualization system that visualizes art history and how artworks have moved from country to country. It plots the historic artworks from the Web Gallery of Art (WGA, https://www.wga.hu/index1.html) by looking at what country the artist was born in, and which country the artwork is currently being displayed; artworks where either information is missing, such as anonymous works or works in private collections, are not included. It can be used to explore what artworks are created, transferred, and displayed in which countries, and by using rich filtering features focus the analysis on specific areas of interest such as time periods and art forms.

## How to Run

All libraries are included within the repo, and so there is no need for installation

1. Place this repository within a server environment

    - for example, for XAMPP the environment is the htdocs folder

1. Begin the server

1. Open the index.html file in your browser

    - for example, for XAMPP the browser URL is localhost/\<path to repo\>/csci-4166-project/index.html

After following these steps, you should see the visualization directly in your browser

## Features

The concept of the visualization is that it shows the countries in which artworks have originated from, as well as where they are displayed, and are connected through gradient lines.

- By clicking on an area of the map, you are able to scroll to that region, centering on the screen.

- By clicking on a country (one of the black dots on the map), it will highlight all of the lines that originate or destinate at the country. It will also show the country and all of its artworks on the right sidebar.

- By changing the 'Map Projection Type' switch on the bottom, you can change the map from a flat projection to an orbital projection, which is useful to see the distances between the focused country and the other countries it is relevant with.

- By enabling the 'Magnifying Glass Zoom on Click' switch on the bottom, you can click on a region of the map and have it magnified, useful for understanding data in high density regions such as Europe. You can also adjust the radius and distortion levels using the sliders.

- By clicking on the (+) and (-) buttons, you can zoom the map in and out. This scales the entire map including the dots and lines, and so if you want to understand a noisy region better the Magnifying Glass Zoom is more effective.

- A total of four visualizations to analyze different aspects of the dataset and compare between visualizations to find patterns. Interaction is connected between them, and hovering or clicking on countries or travels between countries highlights them on all visualizations. See Figures 1 and 3 for screenshots. These four are:

    - A map plotting countries, cities within countries, and travel lines for each artwork going from one country to another. These can be hovered to highlight it on all visualizations, or clicked to see it in the artworks visualization sidebar. It also supports changing projections from a traditional flat style to a radial style (see Figure 2), which can be interacted with like a globe to explore by spinning and following lines.
        - By hovering over a country point, it will say how many artworks are originating and displayed in the country, and highlight the country in the graph visualizations if present. Note that in order to do this, no country nor travel can be focused unless there is a connection between the two.
        - By clicking a country point, it will also focus on the country and present more details on the artwork visualization sidebar, showing individual artworks. Clicking again will defocus it.
        - If a country point is focused, hoving on a travel line that comes out of the country will say how many artworks travelled in both directions on the travel path, and highlight the travel in the chord diagram if present.
        - If the above travel line is clicked, it will focus the travel between the two countries and present more details on the artwork visualization sidebar, showing individual artworks. Clicking again will defocus it.
        - By pressing down and dragging across the map, a lasso area will appear. Once the mouse is released, the country points that are within the area will be added or removed from the filter based on the configured Map Controls.
            - If replace is selected (feather icon), the selected countries will replace the existing selection.
            - If additive is selected (plus icon), the selected countries will be added to the existing selection.
            - If subtractive is selected (minus icon), the selected countries will be removed from the existing selection.
        - Note that the highlight on hover and lasso on drag features need to be enabled in the Map Controls. They are enabled on default, but can be disabled to reduce noise or navigation complexity.
        - Change the projection between flat and radial in the Map Controls.
        - Enable a magnifying glass zoom when clicking on the map, which can be enabled in the Map Controls. When enabled, the radius and degree of zoom can be changed, which helps see details in local dense areas such as Europe.
        - Zoom in an out using the plus and minus icons in the bottom right corner. This scales everything equally, and is good for global detail or big picture understanding.
        - See how zoomed in and where the current position of the display is on the map in the display on the bottom left corner.

    - A bar graph plotting the countries that have the most artworks relating to them. The graph can be changed to plot by counting only artworks that originate from the country, artworks that are displayed in the country, or both. It can be hovered or clicked to see details about the country. It also supports advanced controls such as changing the number of countries in the graph, and applying non-linear scaling.
        - There are 3 legends that are shown: Originating, Displayed, and Both.
            - If Originating is clicked, it will show only the originating artworks on the graph and recompute the top countries.
            - If Displayed is clicked, it will show only the displayed artworks on the graph and recompute the top countries.
            - If Both is clicked, it will show both the originating and displayed artworks on the graph as stacked bars, and recompute the top countries. Clicking on Both again will switch which bar is stacked on top of the other.
        - Hovering over a bar will show details about the number of artworks relevant to the country.
        - Clicking on a bar will also focus on the country, showing more details in the artworks visualization sidebar. Clicking again will defocus it.
        - In the advanced controls:
            - The number of bars on the graph can be increased, allowing you to see more countries represented. There is an upper limit of 20 to prevent the elements from getting too small and overflowing.
            - The scale of the y axis can also be changed from a linear scale. If done, larger values will have relatively less effect on the height of the bar, thus allowing you to see bars with large differences in count. However, note that since scaling is not linear, if bars are stacked the bar on the top will become distorted and not be comparable to other bars in the graph. If you wish to analyze these bars, either change the graph to look at only Originating or only Displayed, or switch the order of the bars so the bar is on the bottom of the stack.

    - A chord diagram plotting the relationships between the top countries. The algorithm finds the combination of countries that have the largest total number of artworks shared between them, and plots them radially so they can be compared. Each country is color coded, and artwork travels are colored based on the color of the originating country. They can also be hovered, clicked, and controlled with advanced controls.
        - Hovering over a country will show what country is selected. Since the chord diagram only shows a subset of the relationships, it does not show all artworks that originate or are displayed in a country and so the count is not shown as it is misleading. Selections are highlighted on the map and the bar graph.
            - Hovering over the red part of the country arc highlights only the ribbons for artworks that originate from the country.
            - Hovering over the blue part of the country arc highlights only the ribbons for artworks that are displayed in the country.
            - Hovering over the colored part of the country arc highlights both.
            - Hovering over the name of the country acts the same as hovering over the red part.
        - Clicking on a country will also focus it, showing details in the artworks visualization sidebar. Clicking again will defocus it.
        - Hovering over a ribbon that travels from one country to another will show details about how many artworks travel between the two countries in that direction.
        - Clicking on a ribbon will also show the details of the travel in the selected direction on the artworks visualization sidebar. Clicking again will defocus it.
        - In the advanced controls:
            - The number of countries in the diagram can be changed. There is a maximum of 10, since any more would lead to both overcrowding of the circle, and the number of unique colors that can be identified quickly has been studied to not be much higher than 10 if at all.
            - A scaling can be applied to the artwork counts in each ribbon. Applying a scaling will  relatively reduce the effect of larger counts on the width of the ribbons, and at an extreme will make all ribbons the same width regardless of count. Applying an extreme filter will shift the focus to number of artworks to number of countries each country is sharing with.
            
    - An artworks visualization sidebar, which shows the relevant artworks when one of the other visualizations is clicked. It can show either the artworks originating and displayed in a country, or the artworks exchanged in both directions between two countries. It shows details such as the author, medium, year, and locations, as well as a thumbnail of the artwork and a link to the WGA site for more information.
        - You can also lock the selection by pressing the lock icon at the top of the sidebar. This will ensure that clicking on a different country will not change the focus from this country.
        - You can also remove the focus by pressing on the close button at the top of the sidebar. 

- Extensive filtering functionality, allowing the user to analyze subsets of the data, find patterns or trends, and explore the kinds of artworks that exist (see Figure 4). These features include:

    - The form of artwork, such as paintings, sculptures, and architecture.
    - The theme of the artwork, such as mythological, historical, and landscape.
    - Artist name(s), with a searchable dropdown to select them from.
    - Country name(s), with a searchable dropdown to select them from.
    - Region(s) of the map, through a lassoing tool to select certain specific areas.
        - The countries included in the lasso area are added to the country names filter. Finer control can be achieved in the Map Controls interface, which lets you choose between overriding previous selection, appending the lasso to the existing selection, or removing the lasso from the existing selection.
    - Keywords, allowing the user to type any phrase and see the works that contain it in the title.
        - Writing multiple keywords will run an OR operation to find title with any of the specified keywords, while the AND operator can also be written to require the title to contain all the specified keywords. For example, writing "flower AND water" (capitalization is needed) and adding it to the filters will require the title to contain both words, such as the artwork with the title "Old Woman Watering Flowers".
    - The timeframe, through a dual range slider to set both start year and end year. These are in steps of 50 years.
    - Special filters such as ignoring artworks that originate and are displayed in the same country. This allows for pivoting the analysis to interactions strictly between different countries only.

    All of these filters can be found in the filters tab at the top of the interface. Each filter has an info icon next to it, and hovering over it gives more information on what the filter is used for.

- Smooth interaction animations so it is easy to see how data changes based on changes to the filters. The graphs have multi-step animations that make it clear that elements are no longer on the graph, how the remaining elements change, and what new elements are on the graph.

- Performance considerations such as lazy loading the artworks so they are not all loaded at once unnecessarily. Lazy loading is used in the artworks visulization sidebar, as well as the options in the filter dropdowns.

    - Note that even though measures have been implemented where possible, the visualization system is still computationally expensive and may be slow on slower machines. Applying filters to reduce the number of artworks will help reduce the power load required to interact with the interface. It may also run a lot slower on the first run, and begin to run faster once caches are stored.

## Libraries

This visualization system uses a few libraries in order to run the functionality. They are all included within the repository itself, so installation is not needed. Listed out below are the libraries and what they are used for:

- d3 (v7): The visualization system uses d3 as the driving framework to draw, animate, and manage the visualizations. It can be downloaded at: https://d3js.org/d3.v7.js.

- d3-fisheye: A community-made library that extends the d3 library to create fisheye distortions. It is used in the magnifying glass zoom functionality on the map. The git repository can be found at: https://github.com/duaneatat/d3-fisheye.

- Bootstrap (v5.3): The basic styling and layout is mostly done using Boostrap, as well as some interactions such as tooltips. It can be downloaded at: https://getbootstrap.com/docs/5.3/getting-started/download/.

- Bootstrap Icons (v.1.13): Provides icons that are used in the visualizations, such as the i icon for tooltips and the lock icon for locking selections. More information can be found at: https://icons.getbootstrap.com/.

- Popper.js: A dependency of Bootstrap to make tooltips function. It can be downloaded at: https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js.

- use-bootstrap-select: A community-made library that extends Bootstrap to create a rich dropdown interface, with functionality to search, select multiple, and create new entries in the dropdown. It is used in the filter options that involve dropdowns, such as the artists filter and the title keywords filter. More information can be found at: https://use-bootstrap-select.js.org/#/.

## References

Below is a list of all the resources that I accessed to directly create this visualization, such as dataset sources.

- The artworks data is from the Web Gallery of Art, and can be downloaded at: https://www.wga.hu/index_database.html.

- The countries data is derived from Natural Earth's dataset. Since d3 requires it to be formatted in GeoJSON, I used a translated file from a community member's GitHub repository, which can be downloaded at: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson.

- The WGA artworks data only provides city names and not countries, and also does not provide coordinate location data, so I used a geocoder to create my own dataset of the cities in the WGA dataset. I used GeoName's full text search API to do so, more information can be found at: https://www.geonames.org/export/geonames-search.html. If you are curious, the code that I used to create this dataset is in the download-artwork-regions-csv.js file, and can be run from the console if included in the HTML.

- The color palette for the chord diagram was taken from an article written on the subject, at https://observablehq.com/blog/crafting-data-colors.
