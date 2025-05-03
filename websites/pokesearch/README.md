## Application Type and Description

PokéSearch

I am choosing this application since it lines up the closest to the kinds of projects that I have worked on in the past, being interactive game-like functionality. I also am most familiar with this topic compared to the others, so it will be easier to see if there are any data issues.

The application is capable of searching for Pokémon based on a starting substring of their name, and will return results alphabetically.

It can also conduct basic search filtering, where the user can restrict Pokémon to those who have, for example, any select type, all selected types, or all selected types in their order (i.e if selected FIRE and WATER, then it matches Pokémon with FIRE as their first type and WATER as their second).

The search will only return the name of the Pokémons and possible a few other details, but they can be clicked to show in-depth stats: the genus, Pokémon number, sprites (normal and shiny, as well as female versions if there are gender differences), description, gender rates, generation introduced, height, weight, color, shape, abilities, moves, base stats, forms, varieties, and evolution line. The different forms, varieties, and other Pokémon in the evolution line can be clicked as well, replacing the details of the previously selected one for the new Pokémon.

Any Pokémon can be favorited using the favorite button on either the search results or the focused details modal. These can then be used as a filtering option, allowing the user to view all their selected favorites, or all Pokémon that are not in their favorites, in conjuction with any other filters or searches they wish to conduct.



## How to Use

To run this application, a browser is needed, as is a stable connection as calls to foreign websites are made via API calls. I have found the Google Chrome works well, and Safari works albeit having a few visual problems.

JavaScript also needs to be enabled on the browser, since this application heavily uses JavaScript to render data dynamically.

Since the application is made only using HTML, CSS, and JavaScript, along with BootStrap being imported in the application itself, there are no prerequired softwares that have to be downloaded in order to run this application.

To open the application, open the index.html file (either double-click the file in the folder to open it in your default browser, or write out the absolute path to the file in the URL (different depending on your browser and Operating System)).

Once open, you can search likewise a regular search is conducted, along with some other helpful features:
   - set the search match pattern, for example 'Contains' if you want only to search for a part of a Pokémon's name, or 'Match' if you want to search for a specific Pokémon, or 'Number' if you want to search for a Pokémon by number instead of by name
   - set filters based on the Pokémon's type(s), generation, color, shape, or whether or not you have favorited them
   - order the results based on Pokémon number, alphabetically, or by name length

You can click on any search result to see more details about the Pokémon that matched your search


How to:

Search for a specific Pokémon using their name?
Set the match pattern (to the left of the search bar, default contents being 'Contains') to 'Match', and type the Pokémon's name into the search bar. While any leading or trailing whitespace as well as capitalization will be ignored, typos will cause the search to fail. After clicking 'Search', if the search succeeds the Pokémon details should show up on the screen automatically.

Search for a specific Pokémon using their Pokémon number?
Set the match pattern (to the left of the search bar, default contents being 'Contains') to 'Number', and type the Pokémon's number into the search bar. After clicking 'Search', if the search succeeds the Pokémon details should show up on the screen automatically.

Filter based on types, returning all Pokémon that belong to at least one of the selected types?
Make sure the match pattern (to the left of the search bar, default contents being 'Contains') is not set to 'Match' nor 'Number', as these are exact searches and will not accept blank searches. Also make sure there is no text in the search bar. Then, click the 'Filters' dropdown, and go to the 'Types' section. Click on the 'Types' dropdown and set the option to 'Any of selected types' - this should cause a list of types to appear. Select all the types you want to filter by (you must select at least one, and '???' is not a valid selection), then click 'Search'. All Pokémon that belong to at least one of the selected types should appear, along with which type(s) and what slot (primary type or secondary type) the Pokémon belnogs to.

See the details of the Pokémon?
After conducting a search such as those described above, a list of Pokémon names will appear (unless there was an error in which case an error message will appear informing you what you need to fix, or the search matched no Pokémon in which case you will see a message that 'No Pokémons matched your search'). Click on one you want to see the details for, and it will show a popup of all kinds of data about the Pokémon. You can see the name, type(s), genus, sprites, weight, height, and so on just by scrolling through the popup. You can see even more specific information using the accordian buttons, such as the 'Abilities' button that shows all the abilities the Pokémon can possess, and the 'Moves' button that shows all the moves the Pokémon can learn, categorized by whether they are taught by level-up, breeding, machines (ex. TMs), tutors, or some other method.

See the evolution chain of the Pokémon?
In the popup discussed in the above answer, there is also an 'Evolutions' button, which when clicking will show the evolution chain this Pokémon is a part of, if this Pokémon is not the only Pokémon in the evolution line. It can be read as follows:
   - All Pokémon that can evolve into other Pokémon have a light box below their sprite. All the sprites in this box that are Pokémon that are further up the evolution chain to this Pokémon. If the sprite is not in a different box itself, it means that it is a direct evolution.
   - The Pokémon (other than the first Pokémon in the chain) have arrows going into their sprites, with some text on them. This text represents how the Pokémon can evolve (ex at a certain level, using a certain item). The Pokémon it evolves from is the Pokémon that is above the innermost box they are contained within.
   - Simple, non-branching evolution lines (ex. Bulbasaur) are very easy to see and understand on both mobile and desktop. Complex evolution lines (ex. Eevee, Applin) are harder to understand, especially on mobile, but using these rules it can be worked out which Pokémon evolve into which other and how.
All the sprites in this section can also clicked. Even though only the current selected sprites has a viewable sprite (the rest being black circles), after clicking on a black circle the respective Pokémon's stats will be loaded, overwriting the current Pokémon data in the opened popup.

Favorite my favorite Pokémons?
Either in the results of the search below each Pokémon, or in the details popup for that specific Pokémon, there is a favorite button (button with a heart icon and text stating 'favorite' or 'favorited'). Clicking that button will toggle the Pokémon from being added and removed from your favorites list. If the heart icon is unfilled and the text says 'favorite', clicking the button will add the Pokémon to your favorites. If the heart icon is filled with red and the text says 'favorited', then the Pokémon is already favorited and clicking the button will remove the Pokémon from your favorites. These favorites will persist after reload, but will not persist if the webpage is opened in a different tab.

View my favorite Pokémons?
These Pokémon in your favorites can be viewed by filtering under the 'Favorites' filter. It is done in the same way the types filtering works, where if you select the 'Only favorites' option under the 'Favorite' section, with no other filters or text inputs, all your favorites will be displayed in the search results. Since the favorites are displayed just like any other filter, it means that you can filter within your favorites just as you would any other filtering search (ex. find all your favorites that are water type). These favorites will persist after reload, but will not persist if the webpage is opened in a different tab.


## Features

- Search through all Pokémon based on a string that is found in a Pokémon's name (empty allowed), based on the search match patterns:
   - Contains: returns all Pokémon that have the search string as a substring of their name
   - Matches: returns the Pokémon that exactly matches the searched string, case insensitive, or nothing if it is not found
   - Starts: returns all Pokémon that have the search string as a starting substring of their name
   - Ends: returns all Pokémon that have the search string as an ending substring of their name
      - NOTE: all the above must only contain alphabet letters (uppercase or lowercase), digits (0-9), and spaces, otherwise the search is terminated and the user is given an alert message
   - Number: returns the Pokémon that has the given Pokémon number, or nothing if it is not an existing Pokémon number
      - NOTE: the above must be positive (no negative and no zero) and an integer (no decimal places)
   - Regex: returns all Pokémon that match the searched RegEx

- Filter the Pokémons resulting from the search:
   - Filter based on favorites:
      - Only favorites: keep all Pokémon that are selected as being a favorite (favorite button pressed)
      - Only not favorites: keep all Pokémon that are not selected as being a favorite (favorite button not pressed)

   - Filter based on their type:
      - Any of selected types: keep all Pokémon that have at least one of the selected types
      - All of selected types: keep Pokémon only if they have all the selected types. Can be in any order
      - In order of selected types: keep Pokémon only if they have the selected types, in the order selected
      - None of selected types: keep all Pokémon that are not any of the selected types

   - Filter based on their generation:
      - Any of selected generations: keep all Pokémon that were introduced in one of the selected generations
      - None of selected generations: keep all Pokémon that were not introduced in any of the selected generations

   - Filter based on their color:
      - Any of selected colors: keep all Pokémon that were introduced in one of the selected colors
      - None of selected colors: keep all Pokémon that were not introduced in any of the selected colors

   - Filter based on their shape:
      - Any of selected shapes: keep all Pokémon that were introduced in one of the selected shapes
      - None of selected shapes: keep all Pokémon that were not introduced in any of the selected shapes

   - NOTE: leaving any fields blank will cause an alert to appear and will not let the user conduct the search until either the field is filled or the filter is disabled

- Order the Pokémons resulting from the search and filter:
   - Order based on Pokémon number: order based on the order they are in the API, which is roughly in Pokémon number order, with a few exceptions were megas and variations may be placed at the end of the ordering
   - Order alphabetically: order based on the alphabetical ordering the Pokémons' names
   - Order by name length: order based on the lengths of the Pokémons' names, shorter names coming before longer names. Pokémons with same length names will be orderd by Pokémon number

- Order the favorite Pokémons within the ordered search:
   - Order favorite Pokémons first: place all favorited Pokémons before non-favorited Pokémons
   - Order favorites Pokémons last: place all non-favorited Pokémons before favorited Pokémons

- See stats of a Pokémon:
   - the name of the Pokémon
   - the genus of the Pokémon
   - the Pokémon number of the Pokémon
   - the sprites of the Pokémon:
      - the main sprite 
      - the species sprites, if they exist:
         - a front facing sprite, in a style that matches the other sprites
         - a shiny front facing sprite
         - a female front facing sprite, if there are gender differences
         - a female shiny front facing sprite, if there are gender differences
   - the description of the Pokémon, from the most recently released Pokédex entry
   - the form description of the Pokémon, if the Pokémon has multiple forms
   - the gender rates (percentage for the Pokémon to be female/male), or no gender if the Pokémon is genderless
   - the generation the Pokémon was introduced
   - the weight of the Pokémon
   - the height of the Pokémon
   - the color of the Pokémon
   - the shape of the Pokémon
   - the abilities the Pokémon can have
   - the moves the Pokémon can learn
      - the moves learned through level up, along with the level they are learned
      - the moves learned through breeding
      - the moves learned through machines
      - the moves learned through tutors
      - the moves learned through any other method
   - the base stats of the Pokémon (hp, attack, defense, special attack, special defence, speed)
   - the forms the Pokémon can take (ex. seasonal forms [such as Deerling], random forms [such as Unown])
   - the varieties the Pokémon can take (ex. regional varieties [such as Alolan Raichu], mega evolutions)
   - the evolution line of the Pokémon, along with the way(s) the evolution can occur

- Click through related Pokémon, such as different forms, different varieties, and other Pokémon in the same evolution line, and change focus to look at their stats

- Move through pages of Pokémon that match the search
   - go to the first/last page using the leftmost/rightmost button [<<]/[>>]
   - go to the previous/next page using the left/right button [<]/[>]
   - go to any listed page by clicking on the button with the desired page number
   - show the next 'set' of pages (the pages that are next to be shown, but cannot fit on the limited space of the pagination) by clicking on the see more button [...] — if on the left, it will move left, and right move right

- Change the number of Pokémon results that show up on each page: the default is 20, but can be changed to 10, 30, 50, and 100. Changing this number will reset the page being currently viewed back to the first page

- Click the favorite button on either the search results or specific Pokémon stats page to add them to the user's favorites, and can be used for filtering and viewing. These selections persist through reload

- Click the PokéSearch logo to reset the search and return to a startup state

(currently, the header navigation links do not have any functionality)



## APIs Used

All data is fetched from PokéAPI (https://pokeapi.co)

The Pokémon data is fetched from https://pokeapi.co/api/v2/pokemon/ for all Pokémon (used in search) or https://pokeapi.co/api/v2/pokemon/{name} for specific Pokémon stats

The Pokémon forms data (used to get the different forms) is fetched from https://pokeapi.co/api/v2/pokemon-form/{id} , where the URL path is stored within the Pokémon data API fetch

The Pokémon species data (used to get the different varieties, for example) is fetched from https://pokeapi.co/api/v2/pokemon-species/{id} , where the URL is stored within the Pokémon data API fetch

The Pokémon evolution line data is fetched from https://pokeapi.co/api/v2/evolution-chain/{id} , where the URL is stored within the Pokémon species data API fetch

The Pokémon types data (used in filtering) is fetched from https://pokeapi.co/api/v2/type/

The Pokémon generations data (used in filtering) is fetched from https://pokeapi.co/api/v2/generation/

The Pokémon colors data (used in filtering) is fetched from https://pokeapi.co/api/v2/pokemon-color/

The Pokémon shapes data (used in filtering) is fetched from https://pokeapi.co/api/v2/pokemon-shape/


## Additional Details [As Needed]

I am taking great care to not overwhelm the API by making too many calls, which is why the Pokémon search results are very minimalistic in the information they present (adding a sprite to each search result would be 20 API calls default for each page), as well there are limitations to features like how the colors filter cannot be used to filter for mega evolutions. There are also limitations to the features that I can add due to this, such as how I initially wanted to add a search by language feature where non-english names can be used to find results, however found that I couldn't manage since the other language info is within the API for the specific Pokémons and would therefore require 1000+ API calls just to conduct a simple search. While this makes the features lacking in certain aspects, it is due to the fact that I much higher value the integrity of PokeAPI and do not wish in the slightest to overload the servers.



## Citations & Acknowledgements

The website is created using HTML, CSS, JavaScript, and BootStrap

[1] W3Schools. How TO - Media Queries with JavaScript. Retrieved Jan. 24, 2025 from https://www.w3schools.com/howto/howto_js_media_queries.asp

[2] GitHub Bootstrap. 2024. Modals aria-hidden attirubte. Retrieved Jan. 31, 2025 from https://github.com/twbs/bootstrap/issues/41005

All assets are SVGs that are designed by myself