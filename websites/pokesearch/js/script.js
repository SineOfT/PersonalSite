import "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js";


document.addEventListener("DOMContentLoaded", async () => {


    /////////////////////////////
    //#region HELPER FUNCTIONS //
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    

    /**
     * function takes a json string and returns it in title case, with any hyphens converted into spaces
     * @param {string} string the string to convert to title case
     * @returns the string converted to title case
     */
    function toTitleCase(string) {
        return string
            .split(/[\s-]/)
            .map(word => word.charAt(0).toUpperCase() + word.substring(1))
            .join(" ");
    }

    /**
     * function takes a json string and returns it in title case along with any roman numerals fully capitalized,
     *    with any hyphens converted into spaces
     * NOTE: this is a very improper way to handle this, as any word consisting of i, v, or x will be capitalized,
     *    and any roman numberals larger than XXXIX (39) will not be converted
     * @param {string} string the string to convert to title and capitalized roman numeral case
     * @returns the string converted to title and capitalized roman numberal case
     */
    function toTitleRomanNumeralCase(string) {
        return string
            .split(/[\s-]/)
            .map((word) => {
                // if the word looks like a roman numeral, convert to upper case
                if (/^[ivx]+$/.test(word)) {
                    return word.toUpperCase();
                
                // otherwise, convert the word to title case
                } else {
                    return word.charAt(0).toUpperCase() + word.substring(1);
                }
            })
            .join(" ");
    }

    /**
     * function takes a string and returns it in key case (matches the way keys are named in json),
     *    with all characters converted to lowercase and any spaces converted to hyphens
     * @param {string} string the string to convert to key case
     * @returns the string converted to key case
     */
    function toKeyCase(string) {
        return string
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-");
    }

    /**
     * function takes a pokemon name and its form name, and returns the pokemon name with any form names in braces
     * @param {string} pokemonNameString the name of the pokemon
     * @param {string} pokemonFormNameString the name of the specific pokemon form
     * @returns the pokemon name with any form names in braces
     */
    function toPokemonFormName(pokemonNameString, pokemonFormNameString) {
        let pokemonName = toTitleCase(pokemonNameString);
        let pokemonFormName = toTitleCase(pokemonFormNameString);

        let startIndexOfName = pokemonFormName.indexOf(pokemonName);
        let endIndexOfName = startIndexOfName + pokemonName.length;

        // if the pokemon name is not in the pokemon form name, return the form name unchanged
        if (startIndexOfName === -1) {
            return pokemonFormName;

        } else {
            let pokemonFormNameComponents = [];

            // if some form name comes before the pokemon name, add it to the components list surrounded in braces
            if (startIndexOfName !== 0) {
                // trim any whitespace between the braces
                pokemonFormNameComponents.push(`(${pokemonFormName.slice(0, startIndexOfName).trim()})`);
            }

            // add the pokemon name to the components list
            pokemonFormNameComponents.push(pokemonFormName.slice(startIndexOfName, endIndexOfName));

            // if some form name comes after the pokemon name, add it to the components list surrounded in braces
            if (endIndexOfName !== pokemonFormName.length) {
                // trim any whitespace between the braces
                pokemonFormNameComponents.push(`(${pokemonFormName.slice(endIndexOfName, pokemonFormName.length).trim()})`);
            }

            return pokemonFormNameComponents.join(" "); // add back the trimmed whitespace
        }
    }


    const COLORED_TYPE_CLASS = "colored-pokemon-type"; // the class name of pokemon type colored containers
    const COLORED_TYPE_CLASS_SUFFIX = "-type"; // the suffix of each specific type class, suffix of type name

    /**
     * function takes a pokemon type and creates it into a colored node with the color matching the
     * type's general color, or a default gray if the type color isn't configured
     * @param {string} typeName the name of the string, in lowercase
     * @returns a DOM div element with the pokemon type and color
     */
    function toColoredPokemonTypeNode(typeName) {
        const COLORED_TYPE_NODE = document.createElement("span");
        COLORED_TYPE_NODE.classList.add("border", COLORED_TYPE_CLASS, typeName+COLORED_TYPE_CLASS_SUFFIX);
        COLORED_TYPE_NODE.textContent = toTitleCase(typeName);
        return COLORED_TYPE_NODE;
    }

    //#endregion

    ///////////////////////////
    //#region POKEMON SEARCH //
    ////////////////////////////////////////////////////////////////////////////////////////////////////


    // CONSTANTS //

    const SEARCH_FORM = (() => {
        let searchForm = { };

        searchForm.node = document.getElementById("searchForm"); // the node of the search bar

        searchForm.searchText = {
            startEllipsis: searchForm.node.querySelector(".search-start-ellipsis"),
            endEllipsis: searchForm.node.querySelector(".search-end-ellipsis"),
            regexOpen: searchForm.node.querySelector(".search-regex-open"),
            regexClose: searchForm.node.querySelector(".search-regex-close"),
            number: searchForm.node.querySelector(".search-number")
        };

        searchForm.invalidAlert = searchForm.node.querySelector(".invalid-alert");

        // the nodes of the search filters
        searchForm.filters = { };
        searchForm.filters.node = searchForm.node.querySelector(".pokemon-filters");
        searchForm.filters.collapse = new bootstrap.Collapse(searchForm.filters.node, { toggle: false }); // don't open on startup

        searchForm.filters.types = { };
        searchForm.filters.types.node = searchForm.filters.node.querySelector(".pokemon-types-filter-collapse");
        searchForm.filters.types.collapse = new bootstrap.Collapse(searchForm.filters.types.node, { toggle: false }); // don't open on startup
        searchForm.filters.types.options = searchForm.filters.types.node.querySelector(".pokemon-types-filter");

        searchForm.filters.generations = { };
        searchForm.filters.generations.node = searchForm.filters.node.querySelector(".pokemon-generations-filter-collapse");
        searchForm.filters.generations.collapse = new bootstrap.Collapse(searchForm.filters.generations.node, { toggle: false }); // don't open on startup
        searchForm.filters.generations.options = searchForm.filters.generations.node.querySelector(".pokemon-generations-filter");
        
        searchForm.filters.colors = { };
        searchForm.filters.colors.node = searchForm.filters.node.querySelector(".pokemon-colors-filter-collapse");
        searchForm.filters.colors.collapse = new bootstrap.Collapse(searchForm.filters.colors.node, { toggle: false }); // don't open on startup
        searchForm.filters.colors.options = searchForm.filters.colors.node.querySelector(".pokemon-colors-filter");
        
        searchForm.filters.shapes = { };
        searchForm.filters.shapes.node = searchForm.filters.node.querySelector(".pokemon-shapes-filter-collapse");
        searchForm.filters.shapes.collapse = new bootstrap.Collapse(searchForm.filters.shapes.node, { toggle: false }); // don't open on startup
        searchForm.filters.shapes.options = searchForm.filters.shapes.node.querySelector(".pokemon-shapes-filter");
    
        // freeze the object, don't want any mutation
        return Object.freeze(searchForm);
    })();

    const FAVORITES_LINK = document.getElementById("favorites-link");

    // the classes of the search filter checkboxes
    const TYPE_FILTER_CHECKBOX_CLASS = "pokemon-type-filter-check";
    const GENERATION_FILTER_CHECKBOX_CLASS = "pokemon-generation-filter-check";
    const COLOR_FILTER_CHECKBOX_CLASS = "pokemon-color-filter-check";
    const SHAPE_FILTER_CHECKBOX_CLASS = "pokemon-shape-filter-check";
    
    const ORDERED_CHECKBOX_CLASS = "ordered-checkbox";

    const SEARCH_TEXT_BREAKPOINT_SIZE = "sm"; // the bootstrap breakpoint above which search text should be displayed

    // the name of a type that has yet to be determined (different to unknown since the type might exist, just not sure given available data)
    const UNDETERMINED_TYPE_NAME = "???";

    const MAX_POKEMON_TYPE_COUNT = 2; // the maximum number of types a pokemon can have


    // VARIABLES //


    let pokemonsSearch = []; // a list of all the pokemon that matches the search, in order of most relevant

    // the previously selected pokemon filter selects, stored to call onDeselect()
    let prevSelectedPokemonSearchMatchPatternSelect = "contains";
    let prevSelectedPokemonTypesFilterSelect = "none";
    let prevSelectedPokemonGenerationsFilterSelect = "none";
    let prevSelectedPokemonColorsFilterSelect = "none";
    let prevSelectedPokemonShapesFilterSelect = "none";
    
    let selectedPokemonTypesFilterOrder = []; // the types currently selected, in order
    

    // BEHAVIOR OBJECTS //


    // defines the functionality behaviors of the different select options for the pokemon search match patterns
    const POKEMON_SEARCH_MATCH_PATTERN_BEHAVIORS = {
        "contains": {
            onSelect: () => {
                SEARCH_FORM.searchText.startEllipsis.classList.add(`d-${SEARCH_TEXT_BREAKPOINT_SIZE}-flex`);
                SEARCH_FORM.searchText.endEllipsis.classList.add(`d-${SEARCH_TEXT_BREAKPOINT_SIZE}-flex`);
            },
            onDeselect: () => {
                SEARCH_FORM.searchText.startEllipsis.classList.remove(`d-${SEARCH_TEXT_BREAKPOINT_SIZE}-flex`);
                SEARCH_FORM.searchText.endEllipsis.classList.remove(`d-${SEARCH_TEXT_BREAKPOINT_SIZE}-flex`);
            },
            // valid if all characters alphabet, digit, or space
            isInvalid: (searchInput) => /^[a-zA-Z0-9\s]*$/.test(searchInput)
                ? null
                : "Pokémon name must only consist of letters, digits, and spaces",
            filterPokemons: async (pokemons, searchInput) => {
                let key = toKeyCase(searchInput);
                return pokemons.filter(pokemon => pokemon.name.includes(key));
            },
            unique: false
        },
        "matches": {
            onSelect: () => { },
            onDeselect: () => { },
            // valid if all characters alphabet, digit, or space, and not only whitespace
            isInvalid: (searchInput) => /^[a-zA-Z0-9\s]+$/.test(searchInput)
                ? null
                : /^\s*$/.test(searchInput) // check if failed because only whitespace or invalid character
                    ? "Pokémon name must contain characters"
                    : "Pokémon name must only consist of letters, digits, and spaces",
            filterPokemons: async (pokemons, searchInput) => {
                let key = toKeyCase(searchInput);
                return pokemons.filter(pokemon => pokemon.name === key);
            },
            unique: true
        },
        "starts": {
            onSelect: () => {
                SEARCH_FORM.searchText.endEllipsis.classList.add(`d-${SEARCH_TEXT_BREAKPOINT_SIZE}-flex`);
            },
            onDeselect: () => {
                SEARCH_FORM.searchText.endEllipsis.classList.remove(`d-${SEARCH_TEXT_BREAKPOINT_SIZE}-flex`);
            },
            // valid if all characters alphabet, digit, or space
            isInvalid: (searchInput) => /^[a-zA-Z0-9\s]*$/.test(searchInput)
                ? null
                : "Pokémon name must only consist of letters, digits, and spaces",
            filterPokemons: async (pokemons, searchInput) => {
                let key = toKeyCase(searchInput);
                return pokemons.filter(pokemon => pokemon.name.startsWith(key));
            },
            unique: false
        },
        "ends": {
            onSelect: () => {
                SEARCH_FORM.searchText.startEllipsis.classList.add(`d-${SEARCH_TEXT_BREAKPOINT_SIZE}-flex`);
            },
            onDeselect: () => {
                SEARCH_FORM.searchText.startEllipsis.classList.remove(`d-${SEARCH_TEXT_BREAKPOINT_SIZE}-flex`);
            },
            // valid if all characters alphabet, digit, or space
            isInvalid: (searchInput) => /^[a-zA-Z0-9\s]*$/.test(searchInput)
                ? null
                : "Pokémon name must only consist of letters, digits, and spaces",
            filterPokemons: async (pokemons, searchInput) => {
                let key = toKeyCase(searchInput);
                return pokemons.filter(pokemon => pokemon.name.endsWith(key));
            },
            unique: false
        },
        "number": {
            onSelect: () => {
                SEARCH_FORM.searchText.number.classList.add(`d-${SEARCH_TEXT_BREAKPOINT_SIZE}-flex`);
            },
            onDeselect: () => {
                SEARCH_FORM.searchText.number.classList.remove(`d-${SEARCH_TEXT_BREAKPOINT_SIZE}-flex`);
            },
            // valid if can successfully parse to positive integer
            isInvalid: (searchInput) => {
                let numberIndex = parseInt(searchInput);
                // invalid if input failed to parse into integer
                if (isNaN(numberIndex)) {
                    return "Pokémon number must be valid integer";
                }
                // invalid if input parses to nonpositive integer
                if (numberIndex <= 0) {
                    return "Pokémon number must be positive";
                }
                // otherwise is valid
                return null;
            },
            filterPokemons: async (pokemons, searchInput) => {
                let numberIndex = parseInt(searchInput)-1;

                const POKEMON_SPECIES_RESPONSE = await fetch("https://pokeapi.co/api/v2/pokemon-species/?limit=99999"); // arbituarily limit, fetch all
                const POKEMON_SPECIES_DATA = await POKEMON_SPECIES_RESPONSE.json();
                let pokemonSpecies = POKEMON_SPECIES_DATA.results[numberIndex];

                return pokemons.filter(pokemon => pokemon.name === pokemonSpecies?.name);
            },
            unique: true
        },
        "regex": {
            onSelect: () => {
                SEARCH_FORM.searchText.regexOpen.classList.add(`d-${SEARCH_TEXT_BREAKPOINT_SIZE}-flex`);
                SEARCH_FORM.searchText.regexClose.classList.add(`d-${SEARCH_TEXT_BREAKPOINT_SIZE}-flex`);
            },
            onDeselect: () => {
                SEARCH_FORM.searchText.regexOpen.classList.remove(`d-${SEARCH_TEXT_BREAKPOINT_SIZE}-flex`);    
                SEARCH_FORM.searchText.regexClose.classList.remove(`d-${SEARCH_TEXT_BREAKPOINT_SIZE}-flex`);    
            },
            // any string valid, since RegExs are so flexible and would be pointless to try validating impossible names
            isInvalid: (_searchInput) => null,
            filterPokemons: async (pokemons, searchInput) => {
                let regexString = searchInput.replace(/\s/g, "-"); // replace any spaces with hyphens to match the json keys
                let regex = new RegExp(regexString, "i"); // ignore case
                return pokemons.filter(pokemon => regex.test(pokemon.name));
            },
            unique: false
        }
    }

    // defines the functionality behaviors of the different select options for the pokemon favorites filter
    const POKEMON_FAVORITES_FILTER_SELECT_BEHAVIORS = {
        "none": {
            filterPokemons: async (pokemons) => pokemons
        },
        "favorites": {
            filterPokemons: async (pokemons) => pokemons.filter(
                pokemon => favoritePokemons.some(
                    favoritePokemon => favoritePokemon.url === pokemon.url
                )
            )
        },
        "not-favorites": {
            filterPokemons: async (pokemons) => pokemons.filter(
                pokemon => !favoritePokemons.some(
                    favoritePokemon => favoritePokemon.url === pokemon.url
                )
            )
        }
    };

    // defines the functionality behaviors of the different select options for the pokemon types filter
    const POKEMON_TYPES_FILTER_SELECT_BEHAVIORS = {
        "none": {
            onSelect: () => { SEARCH_FORM.filters.types.collapse.hide(); },
            onDeselect: () => { },
            // always valid
            isInvalid: () => null,
            filterPokemons: async (pokemons) => pokemons
        },
        "any": {
            onSelect: () => { SEARCH_FORM.filters.types.collapse.show(); },
            onDeselect: () => { },
            // invalid if there are no selected types (discluding undetermined type)
            isInvalid: () => {
                let typeCheckboxes = TYPE_NAMES
                    .filter(typeName => typeName !== UNDETERMINED_TYPE_NAME)
                    .map(typeName => SEARCH_FORM.node[typeName])
                    .filter(typeCheckbox => typeCheckbox.checked);
                if (typeCheckboxes.length === 0) {
                    return "Must select at least one real type";
                }
                return null;
            },
            filterPokemons: async (pokemons) => {
                let typeCheckboxes = TYPE_NAMES
                    .filter(typeName => typeName !== UNDETERMINED_TYPE_NAME) // filter out the undetermined type, not applicable for any
                    .map(typeName => SEARCH_FORM.node[typeName])
                    .filter(typeCheckbox => typeCheckbox.checked);

                // get an array of arrays of type pokemons, one for each checked type
                /*
                 * since each type needs an API fetch, need to await all these asynchronous functions to finish,
                 * which is why here a new promise is made containing a list of the promise for each type, via Promise.all()
                 */
                let typePokemonsList = await Promise.all(
                    typeCheckboxes.map(
                        async (typeCheckbox) => {
                            const TYPE_RESPONSE = await fetch(typeCheckbox.dataset.url);
                            const TYPE_DATA = await TYPE_RESPONSE.json();
                            return {
                                pokemons: TYPE_DATA.pokemon,
                                type: TYPE_DATA.name
                            };
                        }
                    )
                );

                let filteredPokemons = []; // add the filtered pokemon to this array

                for (let pokemon of pokemons) {
                    let types = [UNDETERMINED_TYPE_NAME, UNDETERMINED_TYPE_NAME]; // pokemon can have up to 2 types
                    let hasAnyType = false; // true if this pokemon has any of selected filtering types

                    // set the type in the respective slot if found to be on this pokemon
                    for (let typePokemons of typePokemonsList) {
                        let typePokemon = typePokemons.pokemons.find(typePokemon => typePokemon.pokemon.url === pokemon.url);
                        if (typePokemon != null) {
                            types[typePokemon.slot-1] = typePokemons.type;
                            hasAnyType = true;
                        }
                    }

                    // if any type matches, push the pokemon along with the types to the resulting list
                    if (hasAnyType) {
                        filteredPokemons.push({ ...pokemon, types });
                    }
                }

                return filteredPokemons;
            }
        },
        "all": {
            onSelect: () => { SEARCH_FORM.filters.types.collapse.show(); },
            onDeselect: () => { },
            // invalid if there are no selected types or if more than 2 types selected (discluding undetermined type)
            isInvalid: () => {
                let typeCheckboxes = TYPE_NAMES
                    .filter(typeName => typeName !== UNDETERMINED_TYPE_NAME)
                    .map(typeName => SEARCH_FORM.node[typeName])
                    .filter(typeCheckbox => typeCheckbox.checked);
                if (typeCheckboxes.length === 0) {
                    return "Must select at least one real type";
                }
                if (typeCheckboxes.length > MAX_POKEMON_TYPE_COUNT) {
                    return `Must select at most ${MAX_POKEMON_TYPE_COUNT} real types`;
                }
                return null;
            },
            filterPokemons: async (pokemons) => {
                let typeCheckboxes = TYPE_NAMES
                    .filter(typeName => typeName !== UNDETERMINED_TYPE_NAME) // filter out the undetermined type, not applicable for all
                    .map(typeName => SEARCH_FORM.node[typeName])
                    .filter(typeCheckbox => typeCheckbox.checked);

                // get an array of arrays of type pokemons, one for each checked type
                /*
                 * since each type needs an API fetch, need to await all these asynchronous functions to finish,
                 * which is why here a new promise is made containing a list of the promise for each type, via Promise.all()
                 */
                let typePokemonsList = await Promise.all(
                    typeCheckboxes.map(
                        async (typeCheckbox) => {
                            const TYPE_RESPONSE = await fetch(typeCheckbox.dataset.url);
                            const TYPE_DATA = await TYPE_RESPONSE.json();
                            return {
                                pokemons: TYPE_DATA.pokemon,
                                type: TYPE_DATA.name
                            };
                        }
                    )
                );

                let filteredPokemons = []; // add the filtered pokemon to this array

                for (let pokemon of pokemons) {
                    let types = [UNDETERMINED_TYPE_NAME, UNDETERMINED_TYPE_NAME]; // pokemon can have up to 2 types
                    let hasAllTypes = true; // false if any type not present

                    // set the type in the respective slot if found to be on this pokemon
                    for (let typePokemons of typePokemonsList) {
                        let typePokemon = typePokemons.pokemons.find(typePokemon => typePokemon.pokemon.url === pokemon.url);
                        if (typePokemon != null) {
                            types[typePokemon.slot-1] = typePokemons.type;
                        } else {
                            hasAllTypes = false;
                        }
                    }

                    // if all types are present, push the pokemon along with the type to the resulting list
                    if (hasAllTypes) {
                        filteredPokemons.push({ ...pokemon, types });
                    }
                }

                return filteredPokemons;
            }
        },
        "ordered": {
            onSelect: () => {
                SEARCH_FORM.filters.types.collapse.show();
                SEARCH_FORM.filters.types.node.classList.add(ORDERED_CHECKBOX_CLASS);
            },
            onDeselect: () => {
                SEARCH_FORM.filters.types.node.classList.remove(ORDERED_CHECKBOX_CLASS);
            },
            // invalid if there are no selected types or if more than 2 types selected (including undetermined type)
            isInvalid: () => {
                if (selectedPokemonTypesFilterOrder.length === 0) {
                    return "Must select at least one type";
                }
                if (selectedPokemonTypesFilterOrder.length > MAX_POKEMON_TYPE_COUNT) {
                    return `Must select at most ${MAX_POKEMON_TYPE_COUNT} types`;
                }
                return null;
            },
            filterPokemons: async (pokemons) => {
                let typeCheckboxes = selectedPokemonTypesFilterOrder
                    .map(typeName => SEARCH_FORM.node[typeName]);

                // get an array of arrays of type pokemons, one for each checked type
                /*
                 * since each type needs an API fetch, need to await all these asynchronous functions to finish,
                 * which is why here a new promise is made containing a list of the promise for each type, via Promise.all()
                 */
                let typePokemonsList = await Promise.all(
                    typeCheckboxes
                        .map(
                            async (typeCheckbox, i) => {
                                // if the type is the undetermined type, return null so can filter out later but i still affected
                                if (typeCheckbox.name === UNDETERMINED_TYPE_NAME) {
                                    return null;
                                }
                                const TYPE_RESPONSE = await fetch(typeCheckbox.dataset.url);
                                const TYPE_DATA = await TYPE_RESPONSE.json();
                                return {
                                    // filter out any pokemon who don't have this type in the specified slot
                                    pokemons: TYPE_DATA.pokemon.filter(typePokemon => typePokemon.slot === i+1),
                                    type: TYPE_DATA.name
                                };
                            }
                        )
                );
                
                
                let filteredPokemons = []; // add the filtered pokemon to this array
                let types = [null, null].map((_, i) => typePokemonsList[i]?.type || UNDETERMINED_TYPE_NAME); // already know types of filtered pokemon
                
                // remove null entries (if undetermined type selected) so doesn't affect filtering
                typePokemonsList = typePokemonsList.filter(typePokemon => typePokemon != null);

                for (let pokemon of pokemons) {
                    let hasAllTypes = true; // false if any type not present

                    // set the type in the respective slot if found to be on this pokemon
                    for (let typePokemons of typePokemonsList) {
                        let typePokemon = typePokemons.pokemons.find(typePokemon => typePokemon.pokemon.url === pokemon.url);
                        if (typePokemon == null) {
                            hasAllTypes = false;
                        }
                    }

                    // if all types are present, push the pokemon along with the type to the resulting list
                    if (hasAllTypes) {
                        filteredPokemons.push({ ...pokemon, types });
                    }
                }

                return filteredPokemons;
            }
        },
        "none-selected": {
            onSelect: () => { SEARCH_FORM.filters.types.collapse.show(); },
            onDeselect: () => { },
            // invalid if there are no selected types (discluding undetermined type)
            isInvalid: () => {
                let typeCheckboxes = TYPE_NAMES
                    .filter(typeName => typeName !== UNDETERMINED_TYPE_NAME)
                    .map(typeName => SEARCH_FORM.node[typeName])
                    .filter(typeCheckbox => typeCheckbox.checked);
                if (typeCheckboxes.length === 0) {
                    return "Must select at least one real type";
                }
                return null;
            },
            filterPokemons: async (pokemons) => {
                let typeCheckboxes = TYPE_NAMES
                .filter(typeName => typeName !== UNDETERMINED_TYPE_NAME) // filter out the undetermined type, not applicable for none-selected
                .map(typeName => SEARCH_FORM.node[typeName])
                    .filter(typeCheckbox => typeCheckbox.checked);

                // get an array of arrays of type pokemons, one for each checked type
                /*
                 * since each type needs an API fetch, need to await all these asynchronous functions to finish,
                 * which is why here a new promise is made containing a list of the promise for each type, via Promise.all()
                 */
                let typePokemonsList = await Promise.all(
                    typeCheckboxes.map(
                        async (typeCheckbox) => {
                            const TYPE_RESPONSE = await fetch(typeCheckbox.dataset.url);
                            const TYPE_DATA = await TYPE_RESPONSE.json();
                            return TYPE_DATA.pokemon.map(typePokemon => typePokemon.pokemon);
                        }
                    )
                );

                // return only the pokemon where they are not contained in any of the type pokemons in the list
                return pokemons.filter(
                    pokemon => !typePokemonsList.some(
                        typePokemons => typePokemons.some(
                            typePokemon => typePokemon.url === pokemon.url
                        )
                    )
                );
            }
        }
    };

    // defines the functionality behaviors of the different select options for the pokemon generations filter
    const POKEMON_GENERATIONS_FILTER_SELECT_BEHAVIORS = {
        "none": {
            onSelect: () => { SEARCH_FORM.filters.generations.collapse.hide(); },
            onDeselect: () => { },
            // always valid
            isInvalid: () => null,
            filterPokemons: async (pokemons) => pokemons
        },
        "any": {
            onSelect: () => { SEARCH_FORM.filters.generations.collapse.show(); },
            onDeselect: () => { },
            // invalid if there are no selected generations
            isInvalid: () => {
                let generationCheckboxes = GENERATION_NAMES
                    .map(generationName => SEARCH_FORM.node[generationName])
                    .filter(generationCheckbox => generationCheckbox.checked);
                if (generationCheckboxes.length === 0) {
                    return "Must select at least one generation";
                }
                return null;
            },
            filterPokemons: async (pokemons) => {
                let generationCheckboxes = GENERATION_NAMES
                    .map(generationName => SEARCH_FORM.node[generationName])
                    .filter(generationCheckbox => generationCheckbox.checked);

                // get an array of arrays of generation pokemons, one for each checked type
                /*
                 * since each generation needs an API fetch, need to await all these asynchronous functions to finish,
                 * which is why here a new promise is made containing a list of the promise for each generation, via Promise.all()
                 */
                let generationPokemonsSpeciesList = await Promise.all(
                    generationCheckboxes.map(
                        async (generationCheckbox) => {
                            const GENERATION_RESPONSE = await fetch(generationCheckbox.dataset.url);
                            const GENERATION_DATA = await GENERATION_RESPONSE.json();
                            return {
                                pokemonsSpecies: GENERATION_DATA.pokemon_species,
                                generation: GENERATION_DATA.name
                            };
                        }
                    )
                );

                // filter only the pokemon where they are contained in any of the generation pokemons in the list
                /*
                 * NOTE: since the generation only holds the pokemon species, the data is not the same and so matching URLs will not work
                 * even matching by name which is done here is not guaranteed to work, it is fully dependant on how the data is stored
                 * special varieties of the same speices (ex. mega evolutions) will also be filtered out regardless
                 */
                let filteredPokemons = []; // add the filtered pokemon to this array

                for (let pokemon of pokemons) {
                    let generation = null;

                    // find the generation, if exists, that has this pokemon
                    for (let generationPokemonsSpecies of generationPokemonsSpeciesList) {
                        if (generationPokemonsSpecies.pokemonsSpecies.some(
                            generationPokemonSpecies => generationPokemonSpecies.name === pokemon.name
                        )) {

                            generation = generationPokemonsSpecies.generation;
                        }
                    }

                    // if the generation was found, add this pokemon along with the generation to the filtered list
                    if (generation != null) {
                        filteredPokemons.push({ ...pokemon, generation });
                    }
                }

                return filteredPokemons;
            }
        },
        "none-selected": {
            onSelect: () => { SEARCH_FORM.filters.generations.collapse.show(); },
            onDeselect: () => { },
            // invalid if there are no selected generations
            isInvalid: () => {
                let generationCheckboxes = GENERATION_NAMES
                    .map(generationName => SEARCH_FORM.node[generationName])
                    .filter(generationCheckbox => generationCheckbox.checked);
                if (generationCheckboxes.length === 0) {
                    return "Must select at least one generation";
                }
                return null;
            },
            filterPokemons: async (pokemons) => {
                let generationCheckboxes = GENERATION_NAMES
                    .map(generationName => SEARCH_FORM.node[generationName])
                    .filter(generationCheckbox => generationCheckbox.checked);

                // get an array of arrays of generation pokemons, one for each checked type
                /*
                 * since each generation needs an API fetch, need to await all these asynchronous functions to finish,
                 * which is why here a new promise is made containing a list of the promise for each generation, via Promise.all()
                 */
                let generationPokemonsSpeciesList = await Promise.all(
                    generationCheckboxes.map(
                        async (generationCheckbox) => {
                            const GENERATION_RESPONSE = await fetch(generationCheckbox.dataset.url);
                            const GENERATION_DATA = await GENERATION_RESPONSE.json();
                            return GENERATION_DATA.pokemon_species;
                        }
                    )
                );

                // return only the pokemon where they are not contained in any of the generation pokemons in the list
                /*
                 * NOTE: since the generation only holds the pokemon species, the data is not the same and so matching URLs will not work
                 * even matching by name which is done here is not guaranteed to work, it is fully dependant on how the data is stored
                 * special varieties of the same speices (ex. mega evolutions) will also be filtered out regardless
                 */
                return pokemons.filter(
                    pokemon => !generationPokemonsSpeciesList.some(
                        generationPokemonsSpecies => generationPokemonsSpecies.some(
                            generationPokemonSpecies => generationPokemonSpecies.name === pokemon.name
                        )
                    )
                );
            }
        }
    };

    // defines the functionality behaviors of the different select options for the pokemon colors filter
    const POKEMON_COLORS_FILTER_SELECT_BEHAVIORS = {
        "none": {
            onSelect: () => { SEARCH_FORM.filters.colors.collapse.hide(); },
            onDeselect: () => { },
            // always valid
            isInvalid: () => null,
            filterPokemons: async (pokemons) => pokemons
        },
        "any": {
            onSelect: () => { SEARCH_FORM.filters.colors.collapse.show(); },
            onDeselect: () => { },
            // invalid if there are no selected colors
            isInvalid: () => {
                let colorCheckboxes = COLOR_NAMES
                    .map(colorName => SEARCH_FORM.node[colorName])
                    .filter(colorCheckbox => colorCheckbox.checked);
                if (colorCheckboxes.length === 0) {
                    return "Must select at least one color";
                }
                return null;
            },
            filterPokemons: async (pokemons) => {
                let colorCheckboxes = COLOR_NAMES
                    .map(colorName => SEARCH_FORM.node[colorName])
                    .filter(colorCheckbox => colorCheckbox.checked);

                // get an array of arrays of color pokemons, one for each checked type
                /*
                    * since each color needs an API fetch, need to await all these asynchronous functions to finish,
                    * which is why here a new promise is made containing a list of the promise for each color, via Promise.all()
                    */
                let colorPokemonsSpeciesList = await Promise.all(
                    colorCheckboxes.map(
                        async (colorCheckbox) => {
                            const COLOR_RESPONSE = await fetch(colorCheckbox.dataset.url);
                            const COLOR_DATA = await COLOR_RESPONSE.json();
                            return {
                                pokemonsSpecies: COLOR_DATA.pokemon_species,
                                color: COLOR_DATA.name
                            };
                        }
                    )
                );

                // filter only the pokemon where they are contained in any of the color pokemons in the list
                /*
                 * NOTE: since the color only holds the pokemon species, the data is not the same and so matching URLs will not work
                 * even matching by name which is done here is not guaranteed to work, it is fully dependant on how the data is stored
                 * special varieties of the same speices (ex. mega evolutions) will also be filtered out regardless
                 */
                let filteredPokemons = []; // add the filtered pokemon to this array

                for (let pokemon of pokemons) {
                    let color = null;

                    // find the color, if exists, that has this pokemon
                    for (let colorPokemonsSpecies of colorPokemonsSpeciesList) {
                        if (colorPokemonsSpecies.pokemonsSpecies.some(
                            colorPokemonSpecies => colorPokemonSpecies.name === pokemon.name
                        )) {

                            color = colorPokemonsSpecies.color;
                        }
                    }

                    // if the color was found, add this pokemon along with the color to the filtered list
                    if (color != null) {
                        filteredPokemons.push({ ...pokemon, color });
                    }
                }

                return filteredPokemons;
            }
        },
        "none-selected": {
            onSelect: () => { SEARCH_FORM.filters.colors.collapse.show(); },
            onDeselect: () => { },
            // invalid if there are no selected colors
            isInvalid: () => {
                let colorCheckboxes = COLOR_NAMES
                    .map(colorName => SEARCH_FORM.node[colorName])
                    .filter(colorCheckbox => colorCheckbox.checked);
                if (colorCheckboxes.length === 0) {
                    return "Must select at least one color";
                }
                return null;
            },
            filterPokemons: async (pokemons) => {
                let colorCheckboxes = COLOR_NAMES
                    .map(colorName => SEARCH_FORM.node[colorName])
                    .filter(colorCheckbox => colorCheckbox.checked);

                // get an array of arrays of color pokemons, one for each checked type
                /*
                    * since each color needs an API fetch, need to await all these asynchronous functions to finish,
                    * which is why here a new promise is made containing a list of the promise for each color, via Promise.all()
                    */
                let colorPokemonsSpeciesList = await Promise.all(
                    colorCheckboxes.map(
                        async (colorCheckbox) => {
                            const COLOR_RESPONSE = await fetch(colorCheckbox.dataset.url);
                            const COLOR_DATA = await COLOR_RESPONSE.json();
                            return COLOR_DATA.pokemon_species;
                        }
                    )
                );

                // return only the pokemon where they are not contained in any of the color pokemons in the list
                /*
                 * NOTE: since the generation only holds the pokemon species, the data is not the same and so matching URLs will not work
                 * even matching by name which is done here is not guaranteed to work, it is fully dependant on how the data is stored
                 * special varieties of the same speices (ex. mega evolutions) will also be filtered out regardless
                 */
                return pokemons.filter(
                    pokemon => !colorPokemonsSpeciesList.some(
                        colorPokemonsSpecies => colorPokemonsSpecies.some(
                            colorPokemonSpecies => colorPokemonSpecies.name === pokemon.name
                        )
                    )
                );
            }
        }
    };

    // defines the functionality behaviors of the different select options for the pokemon shapes filter
    const POKEMON_SHAPES_FILTER_SELECT_BEHAVIORS = {
        "none": {
            onSelect: () => { SEARCH_FORM.filters.shapes.collapse.hide(); },
            onDeselect: () => { },
            // always valid
            isInvalid: () => null,
            filterPokemons: async (pokemons) => pokemons
        },
        "any": {
            onSelect: () => { SEARCH_FORM.filters.shapes.collapse.show(); },
            onDeselect: () => { },
            // invalid if there are no selected shapes
            isInvalid: () => {
                let shapeCheckboxes = SHAPE_NAMES
                    .map(shapeName => SEARCH_FORM.node[shapeName])
                    .filter(shapeCheckbox => shapeCheckbox.checked);
                if (shapeCheckboxes.length === 0) {
                    return "Must select at least one shape";
                }
                return null;
            },
            filterPokemons: async (pokemons) => {
                let shapeCheckboxes = SHAPE_NAMES
                    .map(shapeName => SEARCH_FORM.node[shapeName])
                    .filter(shapeCheckbox => shapeCheckbox.checked);

                // get an array of arrays of shape pokemons, one for each checked type
                /*
                    * since each shape needs an API fetch, need to await all these asynchronous functions to finish,
                    * which is why here a new promise is made containing a list of the promise for each shape, via Promise.all()
                    */
                let shapePokemonsSpeciesList = await Promise.all(
                    shapeCheckboxes.map(
                        async (shapeCheckbox) => {
                            const SHAPE_RESPONSE = await fetch(shapeCheckbox.dataset.url);
                            const SHAPE_DATA = await SHAPE_RESPONSE.json();
                            return {
                                pokemonsSpecies: SHAPE_DATA.pokemon_species,
                                shape: SHAPE_DATA.name
                            }
                        }
                    )
                );

                // filter only the pokemon where they are contained in any of the shape pokemons in the list
                /*
                 * NOTE: since the shape only holds the pokemon species, the data is not the same and so matching URLs will not work
                 * even matching by name which is done here is not guaranteed to work, it is fully dependant on how the data is stored
                 * special varieties of the same speices (ex. mega evolutions) will also be filtered out regardless
                 */
                let filteredPokemons = []; // add the filtered pokemon to this array

                for (let pokemon of pokemons) {
                    let shape = null;

                    // find the shape, if exists, that has this pokemon
                    for (let shapePokemonsSpecies of shapePokemonsSpeciesList) {
                        if (shapePokemonsSpecies.pokemonsSpecies.some(
                            shapePokemonSpecies => shapePokemonSpecies.name === pokemon.name
                        )) {

                            shape = shapePokemonsSpecies.shape;
                        }
                    }

                    // if the shape was found, add this pokemon along with the shape to the filtered list
                    if (shape != null) {
                        filteredPokemons.push({ ...pokemon, shape });
                    }
                }

                return filteredPokemons;
            }
        },
        "none-selected": {
            onSelect: () => { SEARCH_FORM.filters.shapes.collapse.show(); },
            onDeselect: () => { },
            // invalid if there are no selected shapes
            isInvalid: () => {
                let shapeCheckboxes = SHAPE_NAMES
                    .map(shapeName => SEARCH_FORM.node[shapeName])
                    .filter(shapeCheckbox => shapeCheckbox.checked);
                if (shapeCheckboxes.length === 0) {
                    return "Must select at least one shape";
                }
                return null;
            },
            filterPokemons: async (pokemons) => {
                let shapeCheckboxes = SHAPE_NAMES
                    .map(shapeName => SEARCH_FORM.node[shapeName])
                    .filter(shapeCheckbox => shapeCheckbox.checked);

                // get an array of arrays of shape pokemons, one for each checked type
                /*
                    * since each shape needs an API fetch, need to await all these asynchronous functions to finish,
                    * which is why here a new promise is made containing a list of the promise for each shape, via Promise.all()
                    */
                let shapePokemonsSpeciesList = await Promise.all(
                    shapeCheckboxes.map(
                        async (shapeCheckbox) => {
                            const SHAPE_RESPONSE = await fetch(shapeCheckbox.dataset.url);
                            const SHAPE_DATA = await SHAPE_RESPONSE.json();
                            return SHAPE_DATA.pokemon_species;
                        }
                    )
                );

                // return only the pokemon where they are not contained in any of the shape pokemons in the list
                /*
                 * NOTE: since the generation only holds the pokemon species, the data is not the same and so matching URLs will not work
                 * even matching by name which is done here is not guaranteed to work, it is fully dependant on how the data is stored
                 * special varieties of the same speices (ex. mega evolutions) will also be filtered out regardless
                 */
                return pokemons.filter(
                    pokemon => !shapePokemonsSpeciesList.some(
                        shapePokemonsSpecies => shapePokemonsSpecies.some(
                            shapePokemonSpecies => shapePokemonSpecies.name === pokemon.name
                        )
                    )
                );
            }
        }
    };

    // defines the functionality behaviors of the different select options for the pokemon search order
    const POKEMON_SEARCH_ORDER_BEHAVIORS = {
        "number": {
            sortPokemons: (pokemons) => pokemons
        },
        "alphabet": {
            sortPokemons: (pokemons) => {
                pokemons.sort(({ name: a }, { name: b }) => (a < b) ? -1 : (a > b) ? 1 : 0);
                return pokemons;
            }
        },
        "length": {
            sortPokemons: (pokemons) => {
                pokemons.sort(({ name: a }, { name: b }) => a.length - b.length);
                return pokemons;
            }
        }
    };

    // defines the functionality behaviors of the different select options for the pokemon favorite order
    const POKEMON_FAVORITE_ORDER_BEHAVIORS = {
        "none": {
            sortPokemons: (pokemons) => pokemons
        },
        "first": {
            sortPokemons: (pokemons) => {
                let isFavoritePokemons = pokemons.map(pokemon => {
                    return { pokemon, is_favorite: (getFavoriteIndex(pokemon.url) < 0) ? 0 : 1 };
                });
                isFavoritePokemons.sort(({ is_favorite: a }, { is_favorite: b }) => b - a);
                return isFavoritePokemons.map(pokemon => pokemon.pokemon);
            }
        },
        "last": {
            sortPokemons: (pokemons) => {
                let isFavoritePokemons = pokemons.map(pokemon => {
                    return { pokemon, is_favorite: (getFavoriteIndex(pokemon.url) < 0) ? 0 : 1 };
                });
                isFavoritePokemons.sort(({ is_favorite: a }, { is_favorite: b }) => a - b);
                return isFavoritePokemons.map(pokemon => pokemon.pokemon);
            }
        }
    };


    // FUNCTIONS //


    /**
     * function adds the respective text to either the front or end of the search bar on large screen sizes,
     * to make it easier to see the effects of the search match patterns
     */
    function configurePokemonSearchMatchPatternsSelect() {
        SEARCH_FORM.node.pokemonSearchMatchPatternsSelect.selectedIndex = 0; // set default to none

        SEARCH_FORM.node.pokemonSearchMatchPatternsSelect.addEventListener("change", (event) => {
            // run the onDeselect code before the onSelect code so that nothing is unwantingly overwritten if synchronous

            // if somehow the prevous selected select is invalid (which should never happen), just ignore
            POKEMON_SEARCH_MATCH_PATTERN_BEHAVIORS[prevSelectedPokemonSearchMatchPatternSelect]?.onDeselect();
            
            let selectedBehavior = POKEMON_SEARCH_MATCH_PATTERN_BEHAVIORS[event.target.value];
            if (selectedBehavior == null) {
                // if the select behavior is not defined, warn the user and reset the select to its default value
                console.warn("selected match pattern select not configured");
                event.target.value = "contains";
                selectedBehavior = POKEMON_SEARCH_MATCH_PATTERN_BEHAVIORS[event.target.value];
            }
            selectedBehavior.onSelect();

            prevSelectedPokemonSearchMatchPatternSelect = event.target.value;
        });

        // configure the currently selected match pattern
        POKEMON_SEARCH_MATCH_PATTERN_BEHAVIORS[SEARCH_FORM.node.pokemonSearchMatchPatternsSelect.value]?.onSelect();
    }

    /**
     * function populates the pokemon types filter in the search with the types fetched from the PokeAPI,
     * with the needed functionality and default values
     * @returns an array of the names of each type
     */
    async function configurePokemonTypesFilter() {
        const POKEMON_TYPES_RESPONSE = await fetch("https://pokeapi.co/api/v2/type/?limit=99999"); // arbituarily limit, fetch all
        const POKEMON_TYPES_DATA = await POKEMON_TYPES_RESPONSE.json();

        // add the undetermined type to the list of types
        const TYPE_NAMES = [...POKEMON_TYPES_DATA.results, { name: UNDETERMINED_TYPE_NAME }].map((type) => {
            let id = `${type.name}FilterId`;

            const TYPE_FILTER = document.createElement("div");
            TYPE_FILTER.classList.add("form-check", "col");
            SEARCH_FORM.filters.types.options.appendChild(TYPE_FILTER);

            const TYPE_FILTER_CHECKBOX = document.createElement("input");
            // disabled by default since all types is default
            TYPE_FILTER_CHECKBOX.classList.add("form-check-input", TYPE_FILTER_CHECKBOX_CLASS);
            TYPE_FILTER_CHECKBOX.type = "checkbox";
            TYPE_FILTER_CHECKBOX.value = "";
            TYPE_FILTER_CHECKBOX.checked = false;
            TYPE_FILTER_CHECKBOX.name = type.name;
            TYPE_FILTER_CHECKBOX.dataset.url = type.url; // add custom data attribute that holds URL to API
            TYPE_FILTER_CHECKBOX.id = id;
            // even though select order is only used when ordered type filtering is enabled, always keep track so as to not dirty data
            TYPE_FILTER_CHECKBOX.addEventListener("change", (event) => {
                if (event.target.checked) {
                    selectedPokemonTypesFilterOrder.push(type.name);
                    event.target.value = selectedPokemonTypesFilterOrder.length; // after push to deal with 0-indexed index and 1-indexed value
                } else {
                    let thisIndex = selectedPokemonTypesFilterOrder.indexOf(type.name);
                    // for all selected types after this type, decrement their value
                    for (let i = thisIndex+1; i < selectedPokemonTypesFilterOrder.length; i++) {
                        SEARCH_FORM.node[selectedPokemonTypesFilterOrder[i]].value -= 1;
                    }
                    // remove this type from the selected list
                    selectedPokemonTypesFilterOrder.splice(thisIndex, 1);
                    event.target.value = "";
                }
            });
            TYPE_FILTER.appendChild(TYPE_FILTER_CHECKBOX);

            const TYPE_FILTER_LABEL = document.createElement("label");
            TYPE_FILTER_LABEL.classList.add("form-check-label");
            TYPE_FILTER_LABEL.htmlFor = id;
            TYPE_FILTER.appendChild(TYPE_FILTER_LABEL);

            const COLORED_TYPE_NODE = toColoredPokemonTypeNode(type.name);
            TYPE_FILTER_LABEL.appendChild(COLORED_TYPE_NODE);

            return type.name;
        });

        SEARCH_FORM.node.pokemonTypesFilterSelect.selectedIndex = 0; // set default to none

        SEARCH_FORM.node.pokemonTypesFilterSelect.addEventListener("change", (event) => {
            // run the onDeselect code before the onSelect code so that nothing is unwantingly overwritten if synchronous

            // if somehow the prevous selected select is invalid (which should never happen), just ignore
            POKEMON_TYPES_FILTER_SELECT_BEHAVIORS[prevSelectedPokemonTypesFilterSelect]?.onDeselect();
            
            let selectedBehavior = POKEMON_TYPES_FILTER_SELECT_BEHAVIORS[event.target.value];
            if (selectedBehavior == null) {
                // if the select behavior is not defined, warn the user and reset the select to its default value
                console.warn("selected type filter not configured");
                event.target.value = "none";
                selectedBehavior = POKEMON_TYPES_FILTER_SELECT_BEHAVIORS[event.target.value];
            }
            selectedBehavior.onSelect();

            prevSelectedPokemonTypesFilterSelect = event.target.value;
        });

        return TYPE_NAMES;
    }

    /**
     * function populates the pokemon generations filter in the search with the generations fetched from the PokeAPI,
     * with the needed functionality and default values
     * @returns an array of the names of each generation
     */
    async function configurePokemonGenerationsFilter() {
        const POKEMON_GENERATIONS_RESPONSE = await fetch("https://pokeapi.co/api/v2/generation/?limit=99999"); // arbituarily large limit, fetch all
        const POKEMON_GENERATIONS_DATA = await POKEMON_GENERATIONS_RESPONSE.json();

        const GENERATION_NAMES = POKEMON_GENERATIONS_DATA.results.map((generation) => {
            let id = `${generation.name}FilterId`;
            let name = toTitleRomanNumeralCase(generation.name);

            const GENERATION_FILTER = document.createElement("div");
            GENERATION_FILTER.classList.add("form-check", "col");
            SEARCH_FORM.filters.generations.options.appendChild(GENERATION_FILTER);

            const GENERATION_FILTER_CHECKBOX = document.createElement("input");
            // disabled by default since all generations is default
            GENERATION_FILTER_CHECKBOX.classList.add("form-check-input", GENERATION_FILTER_CHECKBOX_CLASS);
            GENERATION_FILTER_CHECKBOX.type = "checkbox";
            GENERATION_FILTER_CHECKBOX.value = "";
            GENERATION_FILTER_CHECKBOX.checked = false;
            GENERATION_FILTER_CHECKBOX.name = generation.name;
            GENERATION_FILTER_CHECKBOX.dataset.url = generation.url; // add custom data attribute that holds URL to API
            GENERATION_FILTER_CHECKBOX.id = id;
            GENERATION_FILTER.appendChild(GENERATION_FILTER_CHECKBOX);

            const GENERATION_FILTER_LABEL = document.createElement("label");
            GENERATION_FILTER_LABEL.classList.add("form-check-label");
            GENERATION_FILTER_LABEL.htmlFor = id;
            GENERATION_FILTER_LABEL.textContent = name;
            GENERATION_FILTER.appendChild(GENERATION_FILTER_LABEL);

            return generation.name;
        });

        SEARCH_FORM.node.pokemonGenerationsFilterSelect.selectedIndex = 0; // set default to none

        SEARCH_FORM.node.pokemonGenerationsFilterSelect.addEventListener("change", (event) => {
            // run the onDeselect code before the onSelect code so that nothing is unwantingly overwritten if synchronous

            // if somehow the prevous selected select is invalid (which should never happen), just ignore
            POKEMON_GENERATIONS_FILTER_SELECT_BEHAVIORS[prevSelectedPokemonGenerationsFilterSelect]?.onDeselect();
            
            let selectedBehavior = POKEMON_GENERATIONS_FILTER_SELECT_BEHAVIORS[event.target.value];
            if (selectedBehavior == null) {
                // if the select behavior is not defined, warn the user and reset the select to its default value
                console.warn("selected generation filter not configured");
                event.target.value = "none";
                selectedBehavior = POKEMON_GENERATIONS_FILTER_SELECT_BEHAVIORS[event.target.value];
            }
            selectedBehavior.onSelect();

            prevSelectedPokemonGenerationsFilterSelect = event.target.value;
        });

        return GENERATION_NAMES;
    }

        
    /**
     * function populates the pokemon colors filter in the search with the colors fetched from the PokeAPI,
     * with the needed functionality and default values
     * @returns an array of the names of each color
     */
    async function configurePokemonColorsFilter() {
        const POKEMON_COLORS_RESPONSE = await fetch("https://pokeapi.co/api/v2/pokemon-color/?limit=99999"); // arbituarily limit, fetch all
        const POKEMON_COLORS_DATA = await POKEMON_COLORS_RESPONSE.json();

        const COLOR_NAMES = POKEMON_COLORS_DATA.results.map((color) => {
            let id = `${color.name}FilterId`;
            let name = toTitleCase(color.name);

            const COLOR_FILTER = document.createElement("div");
            COLOR_FILTER.classList.add("form-check", "col");
            SEARCH_FORM.filters.colors.options.appendChild(COLOR_FILTER);

            const COLOR_FILTER_CHECKBOX = document.createElement("input");
            // disabled by default since all colors is default
            COLOR_FILTER_CHECKBOX.classList.add("form-check-input", COLOR_FILTER_CHECKBOX_CLASS);
            COLOR_FILTER_CHECKBOX.type = "checkbox";
            COLOR_FILTER_CHECKBOX.value = "";
            COLOR_FILTER_CHECKBOX.checked = false;
            COLOR_FILTER_CHECKBOX.name = color.name;
            COLOR_FILTER_CHECKBOX.dataset.url = color.url; // add custom data attribute that holds URL to API
            COLOR_FILTER_CHECKBOX.id = id;
            COLOR_FILTER.appendChild(COLOR_FILTER_CHECKBOX);

            const COLOR_FILTER_LABEL = document.createElement("label");
            COLOR_FILTER_LABEL.classList.add("form-check-label");
            COLOR_FILTER_LABEL.htmlFor = id;
            COLOR_FILTER_LABEL.textContent = name;
            COLOR_FILTER.appendChild(COLOR_FILTER_LABEL);

            return color.name;
        });

        SEARCH_FORM.node.pokemonColorsFilterSelect.selectedIndex = 0; // set default to none

        SEARCH_FORM.node.pokemonColorsFilterSelect.addEventListener("change", (event) => {
            // run the onDeselect code before the onSelect code so that nothing is unwantingly overwritten if synchronous

            // if somehow the prevous selected select is invalid (which should never happen), just ignore
            POKEMON_COLORS_FILTER_SELECT_BEHAVIORS[prevSelectedPokemonColorsFilterSelect]?.onDeselect();
            
            let selectedBehavior = POKEMON_COLORS_FILTER_SELECT_BEHAVIORS[event.target.value];
            if (selectedBehavior == null) {
                // if the select behavior is not defined, warn the user and reset the select to its default value
                console.warn("selected color filter not configured");
                event.target.value = "none";
                selectedBehavior = POKEMON_COLORS_FILTER_SELECT_BEHAVIORS[event.target.value];
            }
            selectedBehavior.onSelect();

            prevSelectedPokemonColorsFilterSelect = event.target.value;
        });

        return COLOR_NAMES;
    }

    /**
     * function populates the pokemon shapes filter in the search with the shapes fetched from the PokeAPI,
     * with the needed functionality and default values
     * @returns an array of the names of each shape
     */
    async function configurePokemonShapesFilter() {
        const POKEMON_SHAPES_RESPONSE = await fetch("https://pokeapi.co/api/v2/pokemon-shape/?limit=99999"); // arbituarily limit, fetch all
        const POKEMON_SHAPES_DATA = await POKEMON_SHAPES_RESPONSE.json();

        const SHAPE_NAMES = POKEMON_SHAPES_DATA.results.map((shape) => {
            let id = `${shape.name}FilterId`;
            let name = toTitleCase(shape.name);

            const SHAPE_FILTER = document.createElement("div");
            SHAPE_FILTER.classList.add("form-check", "col");
            SEARCH_FORM.filters.shapes.options.appendChild(SHAPE_FILTER);

            const SHAPE_FILTER_CHECKBOX = document.createElement("input");
            // disabled by default since all shapes is default
            SHAPE_FILTER_CHECKBOX.classList.add("form-check-input", SHAPE_FILTER_CHECKBOX_CLASS);
            SHAPE_FILTER_CHECKBOX.type = "checkbox";
            SHAPE_FILTER_CHECKBOX.value = "";
            SHAPE_FILTER_CHECKBOX.checked = false;
            SHAPE_FILTER_CHECKBOX.name = shape.name;
            SHAPE_FILTER_CHECKBOX.dataset.url = shape.url; // add custom data attribute that holds URL to API
            SHAPE_FILTER_CHECKBOX.id = id;
            SHAPE_FILTER.appendChild(SHAPE_FILTER_CHECKBOX);

            const SHAPE_FILTER_LABEL = document.createElement("label");
            SHAPE_FILTER_LABEL.classList.add("form-check-label");
            SHAPE_FILTER_LABEL.htmlFor = id;
            SHAPE_FILTER_LABEL.textContent = name;
            SHAPE_FILTER.appendChild(SHAPE_FILTER_LABEL);

            return shape.name;
        });

        SEARCH_FORM.node.pokemonShapesFilterSelect.selectedIndex = 0; // set default to none

        SEARCH_FORM.node.pokemonShapesFilterSelect.addEventListener("change", (event) => {
            // run the onDeselect code before the onSelect code so that nothing is unwantingly overwritten if synchronous

            // if somehow the prevous selected select is invalid (which should never happen), just ignore
            POKEMON_SHAPES_FILTER_SELECT_BEHAVIORS[prevSelectedPokemonShapesFilterSelect]?.onDeselect();
            
            let selectedBehavior = POKEMON_SHAPES_FILTER_SELECT_BEHAVIORS[event.target.value];
            if (selectedBehavior == null) {
                // if the select behavior is not defined, warn the user and reset the select to its default value
                console.warn("selected shape filter not configured");
                event.target.value = "none";
                selectedBehavior = POKEMON_SHAPES_FILTER_SELECT_BEHAVIORS[event.target.value];
            }
            selectedBehavior.onSelect();

            prevSelectedPokemonShapesFilterSelect = event.target.value;
        });

        return SHAPE_NAMES;
    }

    /**
     * function fills in the search form data in order to return all favorited pokemons
     */
    function configureSearchFavorites() {
        FAVORITES_LINK.addEventListener("click", (event) => {
            event.preventDefault();
            SEARCH_FORM.node.reset();
            SEARCH_FORM.node.pokemonFavoritesFilterSelect.value = "favorites";
            SEARCH_FORM.node.pokemonTypesFilterSelect.dispatchEvent(new Event("change", { bubbles: true }));
            SEARCH_FORM.node.pokemonFavoritesFilterSelect.dispatchEvent(new Event("change", { bubbles: true }));
            SEARCH_FORM.node.pokemonGenerationsFilterSelect.dispatchEvent(new Event("change", { bubbles: true }));
            SEARCH_FORM.node.pokemonColorsFilterSelect.dispatchEvent(new Event("change", { bubbles: true }));
            SEARCH_FORM.node.pokemonShapesFilterSelect.dispatchEvent(new Event("change", { bubbles: true }));
            searchPokemon();
        });
    }

    /**
     * function uses the fetch API to get matching pokemon based on search
     */
    async function searchPokemon() {
        /**
         * function modifies the DOM to alert the user of an invalid request
         * @param {string} invalidAlertMessage a string explaning the cause of the invalidation
         */
        function sendInvalidAlert(invalidAlertMessage) {
            SEARCH_FORM.invalidAlert.classList.remove("d-none");
            SEARCH_FORM.invalidAlert.textContent = invalidAlertMessage;
            pokemonsSearch = [];
            resetPokemonsAndPagination();
        }
        
        let searchInput = SEARCH_FORM.node.searchInput.value.trim();

        // get behaviors
        let searchMatchPatternBehavior = POKEMON_SEARCH_MATCH_PATTERN_BEHAVIORS[SEARCH_FORM.node.pokemonSearchMatchPatternsSelect.value];
        let favoritesFilterSelectBehavior = POKEMON_FAVORITES_FILTER_SELECT_BEHAVIORS[SEARCH_FORM.node.pokemonFavoritesFilterSelect.value];
        let typesFilterSelectBehavior = POKEMON_TYPES_FILTER_SELECT_BEHAVIORS[SEARCH_FORM.node.pokemonTypesFilterSelect.value];
        let generationsFilterSelectBehavior = POKEMON_GENERATIONS_FILTER_SELECT_BEHAVIORS[SEARCH_FORM.node.pokemonGenerationsFilterSelect.value];
        let colorsFilterSelectBehavior = POKEMON_COLORS_FILTER_SELECT_BEHAVIORS[SEARCH_FORM.node.pokemonColorsFilterSelect.value];
        let shapesFilterSelectBehavior = POKEMON_SHAPES_FILTER_SELECT_BEHAVIORS[SEARCH_FORM.node.pokemonShapesFilterSelect.value];

        // if the input is invalid based on the selected behaviors, alert the relevant message and reset all pokemon search
        let invalidAlertMessage;

        invalidAlertMessage = searchMatchPatternBehavior?.isInvalid(searchInput);
        if (invalidAlertMessage != null) {
            sendInvalidAlert(invalidAlertMessage);
            return;
        }

        invalidAlertMessage = typesFilterSelectBehavior?.isInvalid();
        if (invalidAlertMessage != null) {
            sendInvalidAlert(invalidAlertMessage);
            SEARCH_FORM.filters.collapse.show(); // show the filters in case they were collapsed, so user can see
            return;
        }

        invalidAlertMessage = generationsFilterSelectBehavior?.isInvalid();
        if (invalidAlertMessage != null) {
            sendInvalidAlert(invalidAlertMessage);
            SEARCH_FORM.filters.collapse.show(); // show the filters in case they were collapsed, so user can see
            return;
        }

        invalidAlertMessage = colorsFilterSelectBehavior?.isInvalid();
        if (invalidAlertMessage != null) {
            sendInvalidAlert(invalidAlertMessage);
            SEARCH_FORM.filters.collapse.show(); // show the filters in case they were collapsed, so user can see
            return;
        }

        invalidAlertMessage = shapesFilterSelectBehavior?.isInvalid();
        if (invalidAlertMessage != null) {
            sendInvalidAlert(invalidAlertMessage);
            SEARCH_FORM.filters.collapse.show(); // show the filters in case they were collapsed, so user can see
            return;
        }

        // if no invalid alerts called, hide the alert element
        SEARCH_FORM.invalidAlert.classList.add("d-none");
        SEARCH_FORM.invalidAlert.textContent = "";

        // fetch the pokemons from the API
        const POKEMONS_RESPONSE = await fetch("https://pokeapi.co/api/v2/pokemon/?limit=99999"); // arbituarily limit, fetch all
        const POKEMONS_DATA = await POKEMONS_RESPONSE.json();
        let pokemons = POKEMONS_DATA.results;

        // filter the pokemons based on search match patterns
        if (searchMatchPatternBehavior != null) pokemons = await searchMatchPatternBehavior.filterPokemons(pokemons, searchInput);

        // filter the pokemons based on filters
        if (favoritesFilterSelectBehavior != null) pokemons = await favoritesFilterSelectBehavior.filterPokemons(pokemons);

        if (typesFilterSelectBehavior != null) pokemons = await typesFilterSelectBehavior.filterPokemons(pokemons);

        if (generationsFilterSelectBehavior != null) pokemons = await generationsFilterSelectBehavior.filterPokemons(pokemons);
        
        if (colorsFilterSelectBehavior != null) pokemons = await colorsFilterSelectBehavior.filterPokemons(pokemons);

        if (shapesFilterSelectBehavior != null) pokemons = await shapesFilterSelectBehavior.filterPokemons(pokemons);

        // sort the pokemons based on orders
        let searchOrderBehavior = POKEMON_SEARCH_ORDER_BEHAVIORS[SEARCH_FORM.node.pokemonSearchOrder.value];
        if (searchOrderBehavior != null) pokemons = searchOrderBehavior.sortPokemons(pokemons);

        let favoriteOrderBehavior = POKEMON_FAVORITE_ORDER_BEHAVIORS[SEARCH_FORM.node.pokemonFavoriteOrder.value];
        if (favoriteOrderBehavior != null) pokemons = favoriteOrderBehavior.sortPokemons(pokemons);

        pokemonsSearch = pokemons;
        page = 1; // reset the page to the first page of the search
        updatePageCount();

        // if the search match pattern is unique and a pokemon was successfully found, focus it immediately
        if (searchMatchPatternBehavior.unique && pokemons.length === 1) {
            focusPokemonCard(0);
        }
    }
    

    //#endregion

    /////////////////////////
    //#region POKEMON CARD //
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    
    // CONSTANTS //


    // array of all the pokemon pages on the page
    const POKEMON_PAGES_ARRAY = Array.from(document.querySelectorAll(".pokemon-pages")).map(node => {
        let pages = { };

        pages.node = node;

        pages.rangeText = pages.node.querySelector(".page-range-text");

        pages.cardsPerPage = { };
        pages.cardsPerPage.node = pages.node.querySelector(".cards-per-page-select");
        pages.cardsPerPage.text = pages.cardsPerPage.node.querySelector(".cards-per-page-text");
        pages.cardsPerPage.options = pages.cardsPerPage.node.querySelectorAll(".cards-per-page-options .dropdown-item");

        pages.pagination = { };
        pages.pagination.node = pages.node.querySelector(".pagination");

        pages.pagination.leftmost = { };
        pages.pagination.leftmost.node = pages.pagination.node.querySelector(".page-leftmost");
        pages.pagination.leftmost.link = pages.pagination.leftmost.node.querySelector(".page-link");

        pages.pagination.left = { };
        pages.pagination.left.node = pages.pagination.node.querySelector(".page-left");
        pages.pagination.left.link = pages.pagination.left.node.querySelector(".page-link");

        pages.pagination.rightmost = { };
        pages.pagination.rightmost.node = pages.pagination.node.querySelector(".page-rightmost");
        pages.pagination.rightmost.link = pages.pagination.rightmost.node.querySelector(".page-link");

        pages.pagination.right = { };
        pages.pagination.right.node = pages.pagination.node.querySelector(".page-right");
        pages.pagination.right.link = pages.pagination.right.node.querySelector(".page-link");

        pages.pagination.numbers = Array.from(pages.pagination.node.querySelectorAll(".page-number")).map(node => {
            return { node, link: node.querySelector(".page-link") };
        });

        // return immutable pages object
        return Object.freeze(pages);
    });

    const POKEMON_CARDS = (() => {
        let cards = { };
        cards.node = document.getElementById("pokemonCards");
        cards.noneText = cards.node.querySelector(".pokemon-cards-none-text");
        cards.container = cards.node.querySelector(".pokemon-cards-container");

        // return immutable cards object
        return Object.freeze(cards);
    })();

    // the media queries that describe the current window width
    const VIEWPORT_LG_MEDIA = window.matchMedia("(max-width: 35rem)");
    const VIEWPORT_MD_MEDIA = window.matchMedia("(max-width: 30rem)");
    const VIEWPORT_SM_MEDIA = window.matchMedia("(max-width: 25rem)");
    const VIEWPORT_XS_MEDIA = window.matchMedia("(max-width: 20rem)");


    const POKEMON_CARD_CLASS = "pokemon-card"; // the class placed on pokemon cards
    const POKEMON_CARD_TITLE_CLASS = "pokemon-card-title"; // the class placed on the title (name) on pokemon cards

    // the classes for the conditional extra data gathered from filters
    const POKEMON_CARD_TYPES_CLASS = "pokemon-card-types";
    const POKEMON_CARD_GENERATION_CLASS = "pokemon-card-generation";
    const POKEMON_CARD_COLOR_CLASS = "pokemon-card-color";
    const POKEMON_CARD_SHAPE_CLASS = "pokemon-card-shape";

    const MAX_PAGES_IN_PAGINATION = 10; // the max number of pages shown in the pagination, after which are collapsed
    // the number of pages shown in the pagination given the viewport size
    const SM_PAGES_IN_PAGINATION = 5;
    const MD_PAGES_IN_PAGINATION = 6;
    const LG_PAGES_IN_PAGINATION = 8;


    // pagination collapse tags
    const PAGINATION_COLLAPSE_NONE  = 0;
    const PAGINATION_COLLAPSE_START = 1;
    const PAGINATION_COLLAPSE_END   = 2;
    const PAGINATION_COLLAPSE_BOTH  = 3;


    // VARIABLES //


    let pokemonsOnPage = []; // a list of all the pokemon and their data that are currently displayed on the page

    let pokemonCards = []; // a cache of the pokemon card nodes on the DOM

    // the number of pages shown in the pagination, after which are collapsed
    let pagesInPagination = MAX_PAGES_IN_PAGINATION;
    // the index of the page that will be active when the pagination is collapsed
    let collapsedActivePageIndex = Math.floor(MAX_PAGES_IN_PAGINATION);

    // the number of pokemon cards that are displayed on each page
    let cardsPerPage = 20;

    let page = 1;          // the current page being viewed
    let pageCount = 1;     // the number of pages in the search


    // FUNCTIONS //


    /**
     * function finds the index of a page in the page-items present in the pagination in the DOM
     * @param {*} page the page number to find the index of
     * @returns the index of the page
     */
    function findPageIndexAndCollapse(page, pageCount) {
        if (pageCount <= pagesInPagination) {
            return { index: page-1, collapse: PAGINATION_COLLAPSE_NONE };
        }
        // +-1 for index to page conversion
        if (page <= collapsedActivePageIndex+1) {
            return { index: page-1, collapse: PAGINATION_COLLAPSE_END };
        }
        // +-1 for index to page conversion
        if (page >= pageCount - pagesInPagination + collapsedActivePageIndex+1) {
            return { index: page-1 - pageCount + pagesInPagination, collapse: PAGINATION_COLLAPSE_START };
        }

        return { index: collapsedActivePageIndex, collapse: PAGINATION_COLLAPSE_BOTH };
    }

    /**
     * function configures the page link nodes in the DOM to make a pagination have effect
     */
    function configurePagination() {
        for (const POKEMON_PAGES of POKEMON_PAGES_ARRAY) {
            POKEMON_PAGES.pagination.leftmost.link.addEventListener("click", () => {
                updatePages(1);
            });
            POKEMON_PAGES.pagination.left.link.addEventListener("click", () => {
                let newPage = Math.max(page - 1, 1);
                updatePages(newPage);
            });

            POKEMON_PAGES.pagination.rightmost.link.addEventListener("click", () => {
                updatePages(pageCount);
            });
            POKEMON_PAGES.pagination.right.link.addEventListener("click", () => {
                let newPage = Math.min(page + 1, pageCount);
                updatePages(newPage);
            });

            for (let i = 0; i < pagesInPagination; i++) {
                POKEMON_PAGES.pagination.numbers[i].link.addEventListener("click", () => {
                    let { index: currPageIndex, collapse: currCollapse } = findPageIndexAndCollapse(page, pageCount);
                    if (i === 0 && (
                        currCollapse === PAGINATION_COLLAPSE_START ||
                        currCollapse === PAGINATION_COLLAPSE_BOTH
                    )) {
                        let newPage = Math.max(page - (pagesInPagination-2), 1);
                        updatePages(newPage);
                        return;
                    }

                    if (i === pagesInPagination-1 && (
                        currCollapse === PAGINATION_COLLAPSE_END ||
                        currCollapse === PAGINATION_COLLAPSE_BOTH
                    )) {
                        let newPage = Math.min(
                            page + (pagesInPagination-2),
                            pageCount
                        );
                        updatePages(newPage);
                        return;
                    }

                    let newPage = page + (i - currPageIndex);
                    updatePages(newPage);
                })
            }
        }
    }

    /**
     * function configures the functionality allowed the user to change the number of cards presented on each page
     */
    function configureCardsPerPageSelect() {
        for (const POKEMON_PAGES of POKEMON_PAGES_ARRAY) {
            for (const cardsPerPageOption of POKEMON_PAGES.cardsPerPage.options) {
                cardsPerPageOption.addEventListener("click", (event) => {
                    let newCardsPerPageString = event.target.dataset.count;
                    let newCardsPerPage = parseInt(newCardsPerPageString);

                    for (const PAGES of POKEMON_PAGES_ARRAY) {
                        for (const option of PAGES.cardsPerPage.options) {
                            if (option.dataset.count === newCardsPerPageString) {
                                option.classList.add("active");
                                option.setAttribute("aria-current", "true");
                            } else {
                                option.classList.remove("active");
                                option.removeAttribute("aria-current");
                            }
                        }

                        PAGES.cardsPerPage.text.textContent = newCardsPerPage;
                    }

                    updateCardsPerPage(newCardsPerPage);
                });
            }
        }
    }

    /**
     * function configures the pagination to change sizes based on screen size
     * functionality taken from https://www.w3schools.com/howto/howto_js_media_queries.asp [1]
     */
    function configureUpdatePagesInPaginationFromViewportSize() {
        /*
         * since there are still no pokemon cards, don't want to call
         * updatePagesInPagination which triggers updatePokemonCards
         */
        if (VIEWPORT_XS_MEDIA.matches) {
            // remove left and right buttons on really small screens
            for (const POKEMON_PAGES of POKEMON_PAGES_ARRAY) {
                POKEMON_PAGES.pagination.left.node.classList.add("d-none");
                POKEMON_PAGES.pagination.right.node.classList.add("d-none");
            }
            pagesInPagination = SM_PAGES_IN_PAGINATION;
            // since the default is to be shown on startup, no else code is needed to show these buttons
        } else if (VIEWPORT_SM_MEDIA.matches) {
            pagesInPagination = SM_PAGES_IN_PAGINATION;
        } else if (VIEWPORT_MD_MEDIA.matches) {
            pagesInPagination = MD_PAGES_IN_PAGINATION;
        } else if (VIEWPORT_LG_MEDIA.matches) {
            pagesInPagination = LG_PAGES_IN_PAGINATION;
        } else {
            pagesInPagination = MAX_PAGES_IN_PAGINATION;
        }
        
        collapsedActivePageIndex = Math.floor(pagesInPagination / 2);


        VIEWPORT_XS_MEDIA.addEventListener("change", (event) => {
            // remove left and right buttons on really small screens
            if (event.target.matches) {
                for (const POKEMON_PAGES of POKEMON_PAGES_ARRAY) {
                    POKEMON_PAGES.pagination.left.node.classList.add("d-none");
                    POKEMON_PAGES.pagination.right.node.classList.add("d-none");
                }
            } else {
                // reshow the buttons if the screen size largens
                for (const POKEMON_PAGES of POKEMON_PAGES_ARRAY) {
                    POKEMON_PAGES.pagination.left.node.classList.remove("d-none");
                    POKEMON_PAGES.pagination.right.node.classList.remove("d-none");
                }
            }
        });
        
        VIEWPORT_SM_MEDIA.addEventListener("change", (event) => {
            if (event.target.matches) {
                updatePagesInPagination(SM_PAGES_IN_PAGINATION);
            } else {
                updatePagesInPagination(MD_PAGES_IN_PAGINATION);
            }
        });

        VIEWPORT_MD_MEDIA.addEventListener("change", (event) => {
            if (event.target.matches) {
                updatePagesInPagination(MD_PAGES_IN_PAGINATION);
            } else {
                updatePagesInPagination(LG_PAGES_IN_PAGINATION);
            }
        });

        VIEWPORT_LG_MEDIA.addEventListener("change", (event) => {
            if (event.target.matches) {
                updatePagesInPagination(LG_PAGES_IN_PAGINATION);
            } else {
                updatePagesInPagination(MAX_PAGES_IN_PAGINATION);
            }
        })
    }

    /**
     * function creates a pokemon card with the specified name and sprite in the DOM
     */
    function createHiddenPokemonCard(index) {
        let card = { };

        const CARD_CONTAINER = document.createElement("li");
        CARD_CONTAINER.classList.add("col", "d-none");
        POKEMON_CARDS.container.appendChild(CARD_CONTAINER);
        card.node = CARD_CONTAINER;

        const CARD_NODE = document.createElement("div");
        // center all text + hide card + make sure same height as other cards
        CARD_NODE.classList.add("card", "text-center", "h-100", POKEMON_CARD_CLASS);
        CARD_CONTAINER.appendChild(CARD_NODE);

        const POKEMON_BODY = document.createElement("div");
        // position relative to keep stretched link in pokemon body
        POKEMON_BODY.classList.add("card-body", "position-relative");
        CARD_NODE.appendChild(POKEMON_BODY);

        const TITLE = document.createElement("h2");
        TITLE.classList.add("card-title", POKEMON_CARD_TITLE_CLASS);
        POKEMON_BODY.appendChild(TITLE);
        card.title = TITLE;

        const TYPES = document.createElement("div");
        TYPES.classList.add("card-text", "d-none", POKEMON_CARD_TYPES_CLASS);
        POKEMON_BODY.appendChild(TYPES);
        card.types = TYPES;

        const GENERATION = document.createElement("div");
        GENERATION.classList.add("card-text", "d-none", POKEMON_CARD_GENERATION_CLASS);
        POKEMON_BODY.appendChild(GENERATION);
        card.generation = GENERATION;

        const COLOR = document.createElement("div");
        COLOR.classList.add("card-text", "d-none", POKEMON_CARD_COLOR_CLASS);
        POKEMON_BODY.appendChild(COLOR);
        card.color = COLOR;

        const SHAPE = document.createElement("div");
        SHAPE.classList.add("card-text", "d-none", POKEMON_CARD_SHAPE_CLASS);
        POKEMON_BODY.appendChild(SHAPE);
        card.shape = SHAPE;

        const DETAILS_LINK = document.createElement("a");
        DETAILS_LINK.classList.add(
            "card-link", "link-primary", "link-underline-opacity-25", "link-underline-opacity-100-hover", "stretched-link"
        );
        DETAILS_LINK.tabIndex = 0; // don't want to use href="#" as that will change the page, but want keyboard focusable
        DETAILS_LINK.textContent = "see details";
        DETAILS_LINK.addEventListener("click", () => { focusPokemonCard(index); });
        POKEMON_BODY.appendChild(DETAILS_LINK);

        const HR = document.createElement("hr");
        HR.classList.add("my-0");
        CARD_NODE.appendChild(HR);

        const FAVORITE_BODY = document.createElement("div");
        // no flex grow so that all favorite bodies are the same height, even if cards different heights
        FAVORITE_BODY.classList.add("card-body", "flex-grow-0");
        CARD_NODE.appendChild(FAVORITE_BODY);
        
        const FAVORITE_BUTTON = document.createElement("button");
        FAVORITE_BUTTON.type = "button";
        FAVORITE_BUTTON.classList.add("btn", "btn-light", "border", "d-flex", "align-items-center", "column-gap-2", POKEMON_FAVORITE_BUTTON_CLASS);
        FAVORITE_BUTTON.addEventListener("click", () => favoritePokemonCard(index));
        FAVORITE_BODY.appendChild(FAVORITE_BUTTON);
        card.favoriteButton = FAVORITE_BUTTON;

        pokemonCards.push(card);
    }

    /**
     * function removes the last pokemon card from the DOM and from the cache
     */
    function popPokemonCard() {
        let pokemonCard = pokemonCards.pop();
        pokemonCard?.node.remove();
    }

    /**
     * function resets the pokemon cards and the pagination to be hidden
     */
    function resetPokemonsAndPagination() {        
        POKEMON_CARDS.node.classList.add("d-none");
        for (const POKEMON_PAGES of POKEMON_PAGES_ARRAY) {
            POKEMON_PAGES.node.classList.add("d-none");
        }
        page = 1;
        pageCount = 1;
        pokemonsOnPage = [];
    }

    /**
     * function updates the number of pokemon cards on the webpage, updating the data accordingly as well
     * @param {number} newCardsPerPage the new number of pokemon cards on the page
     */
    function updateCardsPerPage(newCardsPerPage) {
        let decCount = cardsPerPage - newCardsPerPage;
        if (decCount < 0) {
            for (let i = cardsPerPage; i < newCardsPerPage; i++) {
                createHiddenPokemonCard(i);
            }
        } else if (decCount > 0) {
            for (let i = 0; i < decCount; i++) {
                popPokemonCard();
            }
        }

        cardsPerPage = newCardsPerPage;
        page = 1;
        updatePageCount();
    }

    /**
     * function updates the maximum number of pages viewable in the pokemon pagination before collapsing
     * @param {number} newPagesInPagination the new number of pages in the pagination
     */
    function updatePagesInPagination(newPagesInPagination) {
        pagesInPagination = newPagesInPagination;
        // the active page when collapsed is around the center
        collapsedActivePageIndex = Math.floor(pagesInPagination / 2);
        updatePageCount();
    }

    /**
     * function updates the page count of the pokemon search
     * used when the search results change
     */
    function updatePageCount() {
        let newPageCount = Math.ceil(pokemonsSearch.length / cardsPerPage);
        let collapseCount = newPageCount - pagesInPagination;
        
        for (const POKEMON_PAGES of POKEMON_PAGES_ARRAY) {
            // deactivate all page number nodes, in case they were selected
            for (const pageNumber of POKEMON_PAGES.pagination.numbers) {
                pageNumber.node.classList.remove("active");
            }
            
            if (collapseCount <= 0) {
                // hide the mostest buttons, since all pages will be displayed at all times
                POKEMON_PAGES.pagination.leftmost.node.classList.add("d-none");
                POKEMON_PAGES.pagination.rightmost.node.classList.add("d-none");

                for (let i = 0; i < newPageCount; i++) {
                    POKEMON_PAGES.pagination.numbers[i].node.classList.remove("d-none");
                    POKEMON_PAGES.pagination.numbers[i].link.textContent = i+1; // convert index to page number
                }
                for (let i = newPageCount; i < MAX_PAGES_IN_PAGINATION; i++) {
                    POKEMON_PAGES.pagination.numbers[i].node.classList.add("d-none");
                }

            } else {
                // show the mostest buttons in case they are hidden
                POKEMON_PAGES.pagination.leftmost.node.classList.remove("d-none");
                POKEMON_PAGES.pagination.rightmost.node.classList.remove("d-none");

                // show all the pages in the pagination
                for (let i = 0; i < pagesInPagination; i++) {
                    POKEMON_PAGES.pagination.numbers[i].node.classList.remove("d-none");
                    POKEMON_PAGES.pagination.numbers[i].link.textContent = "";
                }
                // hide all the remaining pages in the pagination, in case the number of pages is not the maximum
                for (let i = pagesInPagination; i < MAX_PAGES_IN_PAGINATION; i++) {
                    POKEMON_PAGES.pagination.numbers[i].node.classList.add("d-none");
                }
            }

            if (pokemonsSearch.length === 0) {
                POKEMON_PAGES.node.classList.add("d-none"); // hide the pagination if no cards to display
            } else {
                POKEMON_PAGES.node.classList.remove("d-none"); // unhide the pagination
            }

            if (newPageCount <= 1) {
                POKEMON_PAGES.pagination.node.classList.add("d-none");
                // if there is only one page, hide the non-primary pages
                if (!POKEMON_PAGES.node.dataset.primary) { POKEMON_PAGES.node.classList.add("d-none"); }
            } else {
                POKEMON_PAGES.pagination.node.classList.remove("d-none");
            }
        }
        
        let prevPageCount = pageCount;
        pageCount = newPageCount;

        // update the pages, keeping the same page as previously
        updatePages(page, prevPageCount);
    }

    /**
     * function updates the current page being viewed, and updates any visual elements in the pagination as well
     * @param {*} newPage the page that has been newly selected to be viewed
     */
    function updatePages(newPage, prevPageCount = pageCount) {   
        // find what range of pokemon are currently visible on the page     
        let startPokemon = (newPage - 1) * cardsPerPage + 1; // -1 for number=>index, +1 for index=>number
        let endPokemon = Math.min(startPokemon + cardsPerPage - 1, pokemonsSearch.length); // -1 for exclusive range
        
        for (const POKEMON_PAGES of POKEMON_PAGES_ARRAY) {
            // update the page range text
            POKEMON_PAGES.rangeText.textContent = `${startPokemon}-${endPokemon} of ${pokemonsSearch.length}`;

            // if the page is the first page, disable the page left
            if (newPage === 1) {
                POKEMON_PAGES.pagination.left.node.classList.add("disabled");
            } else {
                POKEMON_PAGES.pagination.left.node.classList.remove("disabled");
            }

            // if the page is the last page, disable the page right
            if (newPage === pageCount) {
                POKEMON_PAGES.pagination.right.node.classList.add("disabled");
            } else {
                POKEMON_PAGES.pagination.right.node.classList.remove("disabled");
            }

            let { index: prevIndex } = findPageIndexAndCollapse(page, prevPageCount);
            let { index: newIndex, collapse: newCollapse } = findPageIndexAndCollapse(newPage, pageCount);

            POKEMON_PAGES.pagination.numbers[prevIndex].node.classList.remove("active"); // deactivate the previously active page
            POKEMON_PAGES.pagination.numbers[newIndex].node.classList.add("active"); // activate the newly active page

            if (newCollapse === PAGINATION_COLLAPSE_START) {
                POKEMON_PAGES.pagination.leftmost.node.classList.remove("disabled"); // in case the leftmost button is disabled, enable it
                POKEMON_PAGES.pagination.rightmost.node.classList.add("disabled"); // if the end isn't collapsed, disable the rightmost button
                
                POKEMON_PAGES.pagination.numbers[0].link.textContent = "...";
                for (let i = 1; i < pagesInPagination; i++) {
                    let pageNumber = i+1 + pageCount - pagesInPagination; // +1 for index to page conversion
                    POKEMON_PAGES.pagination.numbers[i].link.textContent = pageNumber;
                }

            } else if (newCollapse === PAGINATION_COLLAPSE_END) {
                POKEMON_PAGES.pagination.leftmost.node.classList.add("disabled"); // if the start isn't collapsed, disable the leftmost button
                POKEMON_PAGES.pagination.rightmost.node.classList.remove("disabled");
                
                POKEMON_PAGES.pagination.numbers[pagesInPagination-1].link.textContent = "...";
                for (let i = 0; i < pagesInPagination-1; i++) {
                    let pageNumber = i+1; // +1 for index to page conversion
                    POKEMON_PAGES.pagination.numbers[i].link.textContent = pageNumber;
                }

            } else if (newCollapse === PAGINATION_COLLAPSE_BOTH) {
                // in case the mostest buttons are disabled, enable them
                POKEMON_PAGES.pagination.leftmost.node.classList.remove("disabled");
                POKEMON_PAGES.pagination.rightmost.node.classList.remove("disabled");

                POKEMON_PAGES.pagination.numbers[0].link.textContent = "...";
                POKEMON_PAGES.pagination.numbers[pagesInPagination-1].link.textContent = "...";
                for (let i = 1; i < pagesInPagination-1; i++) {
                    let pageNumber = i - collapsedActivePageIndex + newPage; // no +-1, since index subtract each other
                    POKEMON_PAGES.pagination.numbers[i].link.textContent = pageNumber;
                }
            }
        }

        page = newPage;

        updatePokemonCards();
    }

    /**
     * function updates the pokemon cards that are displayed on the page being viewed
     * used when the viewed page is changed
     */
    function updatePokemonCards() {
        let startIndex = (page-1) * cardsPerPage;

        POKEMON_CARDS.node.classList.remove("d-none");

        if (pokemonsSearch.length === 0) {
            POKEMON_CARDS.noneText.classList.remove("d-none");
            POKEMON_CARDS.container.classList.add("d-none");

        } else {
            POKEMON_CARDS.noneText.classList.add("d-none");
            POKEMON_CARDS.container.classList.remove("d-none");

            pokemonsOnPage = pokemonsSearch
                .slice(startIndex, startIndex + cardsPerPage)
                .map((pokemon, i) => {
                    const CARD = pokemonCards[i];

                    CARD.node.classList.remove("d-none"); // make the card visible
                    CARD.node.dataset.url = pokemon.url;

                    CARD.title.textContent = toTitleCase(pokemon.name);

                    if (pokemon.types != null) {
                        for (const TYPE of CARD.types.querySelectorAll("span")) {
                            TYPE.remove();
                        }
                        CARD.types.classList.remove("d-none");
                        CARD.types.appendChild(toColoredPokemonTypeNode(pokemon.types[0]));
                        CARD.types.appendChild(toColoredPokemonTypeNode(pokemon.types[1]));
                    } else {
                        CARD.types.classList.add("d-none");
                    }

                    if (pokemon.generation != null) {
                        CARD.generation.classList.remove("d-none");
                        CARD.generation.textContent = toTitleRomanNumeralCase(pokemon.generation);
                    } else {
                        CARD.generation.classList.add("d-none");
                        CARD.generation.textContent = "";
                    }

                    if (pokemon.color != null) {
                        CARD.color.classList.remove("d-none");
                        CARD.color.textContent = toTitleRomanNumeralCase(pokemon.color);
                    } else {
                        CARD.color.classList.add("d-none");
                        CARD.color.textContent = "";
                    }

                    if (pokemon.shape != null) {
                        CARD.shape.classList.remove("d-none");
                        CARD.shape.textContent = toTitleRomanNumeralCase(pokemon.shape);
                    } else {
                        CARD.shape.classList.add("d-none");
                        CARD.shape.textContent = "";
                    }

                    if (getFavoriteIndex(pokemon.url) === -1) {
                        unfavoriteFavoriteButton(CARD.favoriteButton);
                    } else {
                        favoriteFavoriteButton(CARD.favoriteButton);
                    }
                });

            // hide any unused cards
            for (let i = pokemonsOnPage.length; i < cardsPerPage; i++) {
                pokemonCards[i].node.classList.add("d-none");
            }
        }
    }

    /**
     * function updates the favorites list, either adding or removing the pokemon at this card index
     * @param {number} index 
     */
    function favoritePokemonCard(index) {
        let pokemonIndex = (page-1) * cardsPerPage + index;
        let pokemon = pokemonsSearch[pokemonIndex];

        const FAVORITE_BUTTON = pokemonCards[index].favoriteButton;

        let favoriteIndex = getFavoriteIndex(pokemon.url);
        if (favoriteIndex === -1) {
            addFavoritePokemon(pokemon);
            favoriteFavoriteButton(FAVORITE_BUTTON);

        } else {
            removeFavoritePokemon(favoriteIndex);
            unfavoriteFavoriteButton(FAVORITE_BUTTON);

        }
    }

    /**
     * function updates the pokemon cards' favorite buttons after the current selected pokemon has been favorited
     */
    function updatePokemonCardsFavoritePokemon() {
        for (const CARD of pokemonCards) {
            if (CARD.node.dataset.url === pokemonData.url) {
                favoriteFavoriteButton(CARD.favoriteButton);
            }
        }
    }

    /**
     * function updates the pokemon cards' favorite buttons after the current selected pokemon has been unfavorited
     */
    function updatePokemonCardsUnfavoritePokemon() {
        for (const CARD of pokemonCards) {
            if (CARD.node.dataset.url === pokemonData.url) {
                unfavoriteFavoriteButton(CARD.favoriteButton);
            }
        }
    }


    //#endregion

    //////////////////////////
    //#region POKEMON MODAL //
    ////////////////////////////////////////////////////////////////////////////////////////////////////


    // CONSTANTS //


    const POKEMON_MODAL = (() => {
        let modal = { };

        modal.node = document.getElementById("pokemonFocusModal");
        modal.modal = new bootstrap.Modal(modal.node);

        modal.title = modal.node.querySelector(".modal-title");
        modal.favoriteButton = modal.node.querySelector(".pokemon-favorite-button");

        modal.types = modal.node.querySelector(".pokemon-types");
        modal.genus = modal.node.querySelector(".pokemon-genus");
        modal.number = modal.node.querySelector(".pokemon-number");

        modal.mainSprite = modal.node.querySelector("img.pokemon-sprite-main");
        
        modal.secondarySprites = { };
        modal.secondarySprites.node = modal.node.querySelector(".pokemon-sprite-secondary-container");

        modal.secondarySprites.default = { };
        modal.secondarySprites.default.node = modal.secondarySprites.node.querySelector(".pokemon-caption-sprite-secondary.default");
        modal.secondarySprites.default.sprite = modal.secondarySprites.default.node.querySelector("img");

        modal.secondarySprites.shiny = { };
        modal.secondarySprites.shiny.node = modal.secondarySprites.node.querySelector(".pokemon-caption-sprite-secondary.shiny");
        modal.secondarySprites.shiny.sprite = modal.secondarySprites.shiny.node.querySelector("img");

        modal.secondarySprites.female = { };
        modal.secondarySprites.female.node = modal.secondarySprites.node.querySelector(".pokemon-caption-sprite-secondary.female");
        modal.secondarySprites.female.sprite = modal.secondarySprites.female.node.querySelector("img");

        modal.secondarySprites.femaleShiny = { };
        modal.secondarySprites.femaleShiny.node = modal.secondarySprites.node.querySelector(".pokemon-caption-sprite-secondary.female-shiny");
        modal.secondarySprites.femaleShiny.sprite = modal.secondarySprites.femaleShiny.node.querySelector("img");

        modal.description = modal.node.querySelector(".pokemon-description");
        modal.formDescription = modal.node.querySelector(".pokemon-form-description");

        modal.genderRateBar = { };
        modal.genderRateBar.node = modal.node.querySelector(".pokemon-gender-rate-bar");
        modal.genderRateBar.female = { };
        modal.genderRateBar.female.node = modal.genderRateBar.node.querySelector(".female-rate-bar");
        modal.genderRateBar.female.text = modal.genderRateBar.female.node.querySelector(".progress-bar");
        modal.genderRateBar.male = { };
        modal.genderRateBar.male.node = modal.genderRateBar.node.querySelector(".male-rate-bar");
        modal.genderRateBar.male.text = modal.genderRateBar.male.node.querySelector(".progress-bar");

        modal.generation = modal.node.querySelector(".pokemon-generation");
        modal.weight = modal.node.querySelector(".pokemon-weight");
        modal.height = modal.node.querySelector(".pokemon-height");
        modal.color = modal.node.querySelector(".pokemon-color");
        modal.shape = modal.node.querySelector(".pokemon-shape");

        modal.abilities = modal.node.querySelector(".pokemon-abilities-list");

        modal.moves = { };
        modal.moves.node = modal.node.querySelector(".pokemon-moves-list");
        modal.moves.levelup = { };
        modal.moves.levelup.node = modal.moves.node.querySelector(".pokemon-levelup-moves-list");
        modal.moves.levelup.list = modal.moves.levelup.node.querySelector("ul");
        modal.moves.breed = { };
        modal.moves.breed.node = modal.moves.node.querySelector(".pokemon-breed-moves-list");
        modal.moves.breed.list = modal.moves.breed.node.querySelector("ul");
        modal.moves.machine = { };
        modal.moves.machine.node = modal.moves.node.querySelector(".pokemon-machine-moves-list");
        modal.moves.machine.list = modal.moves.machine.node.querySelector("ul");
        modal.moves.tutor = { };
        modal.moves.tutor.node = modal.moves.node.querySelector(".pokemon-tutor-moves-list");
        modal.moves.tutor.list = modal.moves.tutor.node.querySelector("ul");
        modal.moves.other = { };
        modal.moves.other.node = modal.moves.node.querySelector(".pokemon-other-moves-list");
        modal.moves.other.list = modal.moves.other.node.querySelector("ul");

        modal.baseStats = { };
        modal.baseStats.node = modal.node.querySelector(".pokemon-base-stat-bars-list");
        modal.baseStats.hp = { };
        modal.baseStats.hp.node = modal.baseStats.node.querySelector(".hp-bar");
        modal.baseStats.hp.bar = modal.baseStats.hp.node.querySelector(".progress-bar");
        modal.baseStats.attack = { };
        modal.baseStats.attack.node = modal.baseStats.node.querySelector(".attack-bar");
        modal.baseStats.attack.bar = modal.baseStats.attack.node.querySelector(".progress-bar");
        modal.baseStats.defense = { };
        modal.baseStats.defense.node = modal.baseStats.node.querySelector(".defense-bar");
        modal.baseStats.defense.bar = modal.baseStats.defense.node.querySelector(".progress-bar");
        modal.baseStats.spAttack = { };
        modal.baseStats.spAttack.node = modal.baseStats.node.querySelector(".sp-attack-bar");
        modal.baseStats.spAttack.bar = modal.baseStats.spAttack.node.querySelector(".progress-bar");
        modal.baseStats.spDefense = { };
        modal.baseStats.spDefense.node = modal.baseStats.node.querySelector(".sp-defense-bar");
        modal.baseStats.spDefense.bar = modal.baseStats.spDefense.node.querySelector(".progress-bar");
        modal.baseStats.speed = { };
        modal.baseStats.speed.node = modal.baseStats.node.querySelector(".speed-bar");
        modal.baseStats.speed.bar = modal.baseStats.speed.node.querySelector(".progress-bar");

        modal.forms = modal.node.querySelector(".pokemon-forms-list");
        
        modal.varieties = modal.node.querySelector(".pokemon-varieties-list");

        modal.evolutions = modal.node.querySelector(".pokemon-evolution-line");

        // return immutable modal object
        return Object.freeze(modal);
    })();

    // the sprite loaded in evolution lines and varieties for pokemon that are not currently focused
    const UNKNOWN_POKEMON_SPRITE = "./assets/unknown-pokemon.svg";
    
    const EVOLUTION_TRIGGER_DESCRIPTION_LINE_MULTIPLIER = 2; // how much to multiply the line number by to get the container height, in ems

    const POKEMON_MODAL_HEADING_LEVEL = "h4"; // stored to maintain consitency with accessibility standards of heading levels

    const GENDER_RATE_STEP_COUNT = 8; // the number of steps that are used in the gender rate value stored in the API

    const POKEMON_NUMBER_DIGIT_COUNT = 4;

    // reference classes
    const POKEMON_FORMS_CONTAINER_CLASS = "pokemon-forms-container";
    const POKEMON_VARIETIES_CONTAINER_CLASS = "pokemon-varieties-container";
    const POKEMON_EVOLUTION_CONTAINER_CLASS = "pokemon-evolution-container";

    // CSS classes
    const POKEMON_FORM_SPRITE_CLASS = "pokemon-form-sprite";
    const POKEMON_VARIETY_SPRITE_CLASS = "pokemon-variety-sprite";
    const POKEMON_EVOLUTION_SPRITE_CLASS = "pokemon-evolution-sprite";


    // VARIABLES //


    // cache pokemon relevant data to avoid repeating API fetches unnecessarily when looking at the same family
    let pokemonData = { };
    let pokemonFormData = { };
    let pokemonSpeciesData = { };
    let pokemonEvolutionData = { };

    let pokemonSprites = { };
    let pokemonDefaultSprite = "";


    // FUNCTIONS //


    /**
     * function takes the API URL of a pokemon and stores the relevant data
     * @param {string} pokemonUrl the URL to the API of the pokemon data
     */
    async function updateRelevantPokemonData(pokemonUrl) {
        const POKEMON_RESPONSE = await fetch(pokemonUrl);
        const POKEMON_DATA = await POKEMON_RESPONSE.json();
        pokemonData = { ...POKEMON_DATA, url: pokemonUrl };
    }

    /**
     * funciton takes the API URL of a pokemon and stores the relevant data
     * @param {string} pokemonFormUrl the URL to the API of the pokemon form data
     */
    async function updateRelevantPokemonFormData(pokemonFormUrl) {
        const POKEMON_FORM_RESPONSE = await fetch(pokemonFormUrl);
        const POKEMON_FORM_DATA = await POKEMON_FORM_RESPONSE.json();
        pokemonFormData = { ...POKEMON_FORM_DATA, url: pokemonFormUrl };
    }

    /**
     * function takes the API URL of a pokemon species and stores the relevant data
     * @param {string} pokemonSpeciesUrl the URL to the API of the pokemon species data 
     */
    async function updateRelevantPokemonSpeciesData(pokemonSpeciesUrl) {
        const POKEMON_SPECIES_RESPONSE = await fetch(pokemonSpeciesUrl);
        const POKEMON_SPECIES_DATA = await POKEMON_SPECIES_RESPONSE.json();
        pokemonSpeciesData = { ...POKEMON_SPECIES_DATA, url: pokemonSpeciesUrl };
    }

    /**
     * function takes API URL of a pokemon evolution line and stores the relevant data
     * @param {string} pokemonEvolutionUrl the URL to the API of the pokemon evolution data 
     */
    async function updateRelevantPokemonEvolutionData(pokemonEvolutionUrl) {
        const POKEMON_EVOLUTION_RESPONSE = await fetch(pokemonEvolutionUrl);
        const POKEMON_EVOLUTION_DATA = await POKEMON_EVOLUTION_RESPONSE.json();
        pokemonEvolutionData = { ...POKEMON_EVOLUTION_DATA, url: pokemonEvolutionUrl };
    }

    /**
     * function brings up a modal of the pokemon whose card was clicked, filled with details
     * @param {number} index the index of the card to focus
     */
    async function focusPokemonCard(index) {
        let pokemonIndex = (page-1) * cardsPerPage + index;
        let pokemon = pokemonsSearch[pokemonIndex];

        await updateRelevantPokemonData(pokemon.url);
        await updateRelevantPokemonFormData(pokemonData.forms[0].url);
        await updateRelevantPokemonSpeciesData(pokemonData.species.url);
        await updateRelevantPokemonEvolutionData(pokemonSpeciesData.evolution_chain.url);

        // await the data to be fetched before showing the modal
        showPokemonModal();
    }

    /**
     * function updates the contents of the modal to be of a pokemon form, beforehand hiding the modal
     * @param {string} pokemonFormUrl a path to the API of the pokemon form data
     */
    async function focusPokemonForm(pokemonFormUrl) {
        POKEMON_MODAL.node.addEventListener("hidden.bs.modal", async () => {
            await updateRelevantPokemonFormData(pokemonFormUrl);
            
            // await the data to be fetched before showing the modal
            showPokemonModal();
        }, { once: true });

        POKEMON_MODAL.modal.hide();
    }

    /**
     * function updates the contents of the modal to be of a pokemon, beforehand hiding the modal
     * @param {string} pokemonUrl a path to the API of the pokemon data
     */
    async function focusPokemon(pokemonUrl) {
        POKEMON_MODAL.node.addEventListener("hidden.bs.modal", async () => {
            await updateRelevantPokemonData(pokemonUrl);
            await updateRelevantPokemonFormData(pokemonData.forms[0].url);
            
            // await the data to be fetched before showing the modal
            showPokemonModal();
        }, { once: true });

        POKEMON_MODAL.modal.hide();
    }

    /**
     * function updates the contents of the modal to be of a pokemon species, beforehand hiding the modal
     * @param {string} pokemonSpeciesUrl a path to the API of the pokemon species data
     */
    async function focusPokemonSpecies(pokemonSpeciesUrl) {
        POKEMON_MODAL.node.addEventListener("hidden.bs.modal", async () => {
            // await this call, since the fetched data is needed later
            await updateRelevantPokemonSpeciesData(pokemonSpeciesUrl);

            let pokemonUrl = pokemonSpeciesData.varieties.find(variety => variety.is_default).pokemon.url;
            await updateRelevantPokemonData(pokemonUrl);
            await updateRelevantPokemonFormData(pokemonData.forms[0].url);

            // await the data to be fetched before showing the modal
            showPokemonModal();
        }, { once: true });

        POKEMON_MODAL.modal.hide();
    }

    /**
     * function configures the favorite button to toggle a pokemon as being favorited or not
     */
    function configurePokemonFavoriteButton() {
        POKEMON_MODAL.favoriteButton.addEventListener("click", (event) => {
            let favoriteIndex = getFavoriteIndex(pokemonData.url);
            if (favoriteIndex === -1) {
                addFavoritePokemon({ name: pokemonData.name, url: pokemonData.url });
                favoriteFavoriteButton(event.target);
                updatePokemonCardsFavoritePokemon();
            } else {
                removeFavoritePokemon(favoriteIndex);
                unfavoriteFavoriteButton(event.target);
                updatePokemonCardsUnfavoritePokemon();
            }
        });
    }

    /**
     * function brings up a modal of the pokemon whose data is stored in the caches
     */
    function showPokemonModal() {
        updatePokemonSprites();
        updatePokemonDefaultSprite();

        updatePokemonModalTitle();
        updatePokemonModalFavorite();
        updatePokemonModalTypes();
        updatePokemonModalGenus();
        updatePokemonModalNumber();
        updatePokemonModalSprites();
        updatePokemonModalDescription();
        updatePokemonModalGenderRate();
        updatePokemonModalGeneration();
        updatePokemonModalWeight();
        updatePokemonModalHeight();
        updatePokemonModalColor();
        updatePokemonModalShape();
        updatePokemonModalAbilities();
        updatePokemonModalMoves();
        updatePokemonModalBaseStats();
        updatePokemonModalForms();
        updatePokemonModalVarieties();
        updatePokemonEvolutionLine();

        POKEMON_MODAL.modal.show();
    }

    /**
     * function gets the current pokemon's front facing default and shiny sprites,
     *    as well as female sprites if there are gender differences, and sets them to the pokemonSprites variable
     * also returns whether the sprites are pixelated or not, which is used to set anti-aliasing for the images
     * tries to keep all the sprites of the same type (ex. all official artworks, all form-specific)
     * has an order of priority for which sprites should be prefered over others if all needed sprites present:
     *    1. official artwork
     *    2. default sprites
     *    3. home sprites
     */
    function updatePokemonSprites() {        
        // only if the pokemon and form have the same name (ex. if only one form), should the official artwork be used
        if (pokemonData.name !== pokemonFormData.name) {
            let {
                front_default: defaultSprite,
                front_shiny: shinySprite,
                front_female: femaleSprite,
                front_shiny_female: femaleShinySprite
            } = pokemonFormData.sprites;

            pokemonSprites = { defaultSprite, shinySprite, femaleSprite, femaleShinySprite, pixelated: true };
            return;
        }

        let bestDefaultSprite = null;
        let bestMaleSprites = null;
        let bestSprites = null;

        /*
         * for each of the possible sprite objects stored in the API, in order of priority or 'bestness':
         */
        for (let sprites of [
            { ...pokemonData.sprites.other["official-artwork"], pixelated: false },
            { ...pokemonData.sprites, pixelated: true },
            { ...pokemonData.sprites.other.home, pixelated: false }
        ]) {

            // get the relevant sprites from the sprites object
            let {
                front_default: defaultSprite,
                front_shiny: shinySprite,
                front_female: femaleSprite,
                front_shiny_female: femaleShinySprite,
                pixelated
            } = sprites;
    
            if (defaultSprite != null) {
                if (shinySprite != null) {
                    if (bestSprites == null && femaleSprite != null && femaleShinySprite != null) {
                        // if all the sprites are nonnull and the best has not been found, these are the best sprites
                        bestSprites = { defaultSprite, shinySprite, femaleSprite, femaleShinySprite, pixelated };
                    }
    
                    // if all the male sprites are nonnull and the best has not been found, these are the best male sprites
                    if (bestMaleSprites == null) {
                        bestMaleSprites = { defaultSprite, shinySprite, pixelated };
                    }
                } 
    
                // if the default sprite is nonnull and the best has not been found, this is the best default sprite
                if (bestDefaultSprite == null) {
                    bestDefaultSprite = { defaultSprite, pixelated };
                }
            }
        }

        // if there exists best sprites, set the pokemon sprites as these sprites
        if (bestSprites != null) {
            pokemonSprites = bestSprites;
            return;
        }

        // if there exists only best males sprites, set the pokemon sprites as these sprites with female sprites as null
        if (bestMaleSprites != null) {
            pokemonSprites = { ...bestMaleSprites, femaleSprite: null, femaleShinySprite: null };
            return;
        }

        // if there exist only a best default sprite, set the pokemon sprites' default as this sprite with the rest as null
        if (bestDefaultSprite != null) {
            pokemonSprites = { ...bestDefaultSprite, shinySprite: null, femaleSprite: null, femaleShinySprite: null };
            return;
        }

        // if there are no sprites, return the defaut sprite as an unknown pokemon sprite with the rest as null
        pokemonSprites = {
            defaultSprite: UNKNOWN_POKEMON_SPRITE,
            shinySprite: null, femaleSprite: null, femaleShinySprite: null, pixelated: false
        };
        return;
    }

    /**
     * function gets the current pokemon's front facing default and sets it to the pokemonDefaultSprite variable
     * also returns whether the sprites are pixelated or not, which is used to set anti-aliasing for the images
     * has an order of priority for which sprites should be prefered over others if present:
     *    1. official artwork
     *    2. default sprites
     *    3. home sprites
     */
    function updatePokemonDefaultSprite() {
        // only if the pokemon and form have the same name (ex. if only one form), should the official artwork be used
        if (pokemonData.name !== pokemonFormData.name) {
            pokemonDefaultSprite = { sprite: pokemonFormData.sprites.front_default, pixelated: true };
            return;
        }

        /*
         * for each of the possible sprite objects stored in the API, in order of priority or 'bestness':
         */
        for (let spriteData of [
            { sprite: pokemonData.sprites.other["official-artwork"].front_default, pixelated: false },
            { sprite: pokemonData.sprites.front_default, pixelated: true },
            { sprite: pokemonData.sprites.other.home.front_default, pixelated: false }
        ]) {
            // if this sprite exists, set the default sprite to this sprite
            if (spriteData.sprite != null) {
                pokemonDefaultSprite = spriteData;
                return;
            }
        }

        // if no sprites were found, set the default sprite to an unknown pokemon sprite
        pokemonDefaultSprite = { sprite: UNKNOWN_POKEMON_SPRITE, pixelated: false };
        return;
    }

    /**
     * function updates the pokemon modal's title based on json data
     */
    function updatePokemonModalTitle() {
        POKEMON_MODAL.title.textContent = toPokemonFormName(pokemonData.name, pokemonFormData.name);
    }

    /**
     * function updates the pokemon modal's favorite icon based on json data
     */
    function updatePokemonModalFavorite() {
        if (getFavoriteIndex(pokemonData.url) === -1) {
            unfavoriteFavoriteButton(POKEMON_MODAL.favoriteButton);
        } else {
            favoriteFavoriteButton(POKEMON_MODAL.favoriteButton);
        }
    }

    /**
     * function updates the pokemon modal's type(s) based on json data
     */
    function updatePokemonModalTypes() {
        // get the types
        let types = pokemonFormData.types;
        types.sort((a, b) => a.slot - b.slot);
        types = types.map((type) => type.type.name);

        // update the types
        POKEMON_MODAL.types.querySelectorAll("span").forEach(NODE => { NODE.remove(); }); // delete previous types
        if (types[0] != null) POKEMON_MODAL.types.appendChild(toColoredPokemonTypeNode(types[0]));
        if (types[1] != null) POKEMON_MODAL.types.appendChild(toColoredPokemonTypeNode(types[1]));
    }

    /**
     * function updates the pokemon modal's genus based on json data
     */
    function updatePokemonModalGenus() {
        let genus = pokemonSpeciesData
            .genera
            .findLast(genus => genus.language.name === "en")
            ?.genus;

        POKEMON_MODAL.genus.textContent = genus;
    }

    /**
     * function updates the pokemon modal's pokemon number based on json data
     */
    function updatePokemonModalNumber() {
        let pokemonNumber = pokemonSpeciesData.id.toString();
        let paddingZeroCount = Math.max(POKEMON_NUMBER_DIGIT_COUNT - pokemonNumber.length, 0); // make sure count never below 0
        let paddedPokemonNumber = "0".repeat(paddingZeroCount) + pokemonNumber;
        POKEMON_MODAL.number.textContent = `#${paddedPokemonNumber}`;
    }

    /**
     * function updates the pokemon modal's sprites based on json data
     */
    function updatePokemonModalSprites() {
        POKEMON_MODAL.mainSprite.src = pokemonDefaultSprite.sprite;
        POKEMON_MODAL.mainSprite.alt = `${pokemonData.name} main sprite`;
        if (pokemonDefaultSprite.pixelated) {
            POKEMON_MODAL.mainSprite.classList.add("pixelated");
        } else {
            POKEMON_MODAL.mainSprite.classList.remove("pixelated");
        }

        let pixelated = pokemonSprites.pixelated;
        let hasSpecialSprite = false;

        if (pokemonSprites.defaultSprite != null) {
            POKEMON_MODAL.secondarySprites.default.node.classList.remove("d-none");
            POKEMON_MODAL.secondarySprites.default.sprite.src = pokemonSprites.defaultSprite;
            POKEMON_MODAL.secondarySprites.default.sprite.alt = `${pokemonData.name} default sprite`;
            if (pixelated) {
                POKEMON_MODAL.secondarySprites.default.sprite.classList.add("pixelated");
            } else {
                POKEMON_MODAL.secondarySprites.default.sprite.classList.remove("pixelated");
            }
            // don't set special sprite to true, since this sprite is not special
        } else {
            POKEMON_MODAL.secondarySprites.default.node.classList.add("d-none");
            POKEMON_MODAL.secondarySprites.default.sprite.src = "";
            POKEMON_MODAL.secondarySprites.default.sprite.alt = "hidden sprite";
        }

        if (pokemonSprites.shinySprite != null) {
            POKEMON_MODAL.secondarySprites.shiny.node.classList.remove("d-none");
            POKEMON_MODAL.secondarySprites.shiny.sprite.src = pokemonSprites.shinySprite;
            POKEMON_MODAL.secondarySprites.shiny.sprite.alt = `${pokemonData.name} shiny sprite`;
            if (pixelated) {
                POKEMON_MODAL.secondarySprites.shiny.sprite.classList.add("pixelated");
            } else {
                POKEMON_MODAL.secondarySprites.shiny.sprite.classList.remove("pixelated");
            }
            hasSpecialSprite = true;
        } else {
            POKEMON_MODAL.secondarySprites.shiny.node.classList.add("d-none");
            POKEMON_MODAL.secondarySprites.shiny.sprite.src = "";
            POKEMON_MODAL.secondarySprites.shiny.sprite.alt = "hidden sprite";
        }

        if (pokemonSprites.femaleSprite != null) {
            POKEMON_MODAL.secondarySprites.female.node.classList.remove("d-none");
            POKEMON_MODAL.secondarySprites.female.sprite.src = pokemonSprites.femaleSprite;
            POKEMON_MODAL.secondarySprites.female.sprite.alt = `${pokemonData.name} female sprite`;
            if (pixelated) {
                POKEMON_MODAL.secondarySprites.female.sprite.classList.add("pixelated");
            } else {
                POKEMON_MODAL.secondarySprites.female.sprite.classList.remove("pixelated");
            }
            hasSpecialSprite = true;
        } else {
            POKEMON_MODAL.secondarySprites.female.node.classList.add("d-none");
            POKEMON_MODAL.secondarySprites.female.sprite.src = "";
            POKEMON_MODAL.secondarySprites.female.sprite.alt = "hidden sprite";
        }
        
        if (pokemonSprites.femaleShinySprite != null) {
            POKEMON_MODAL.secondarySprites.femaleShiny.node.classList.remove("d-none");
            POKEMON_MODAL.secondarySprites.femaleShiny.sprite.src = pokemonSprites.femaleShinySprite;
            POKEMON_MODAL.secondarySprites.femaleShiny.sprite.alt = `${pokemonData.name} female shiny sprite`;
            if (pixelated) {
                POKEMON_MODAL.secondarySprites.femaleShiny.sprite.classList.add("pixelated");
            } else {
                POKEMON_MODAL.secondarySprites.femaleShiny.sprite.classList.remove("pixelated");
            }
            hasSpecialSprite = true;
        } else {
            POKEMON_MODAL.secondarySprites.femaleShiny.node.classList.add("d-none");
            POKEMON_MODAL.secondarySprites.femaleShiny.sprite.src = "";
            POKEMON_MODAL.secondarySprites.femaleShiny.sprite.alt = "hidden sprite";
        }

        if (hasSpecialSprite) {
            POKEMON_MODAL.secondarySprites.node.classList.remove("d-none");
        } else {
            POKEMON_MODAL.secondarySprites.node.classList.add("d-none");
        }
    }

    /**
     * function updates the pokemon modal's description and form description if exists, based on json data
     */
    function updatePokemonModalDescription() {
        /*
         * get an english description, replacing any newlines with spaces
         * gets the last description in the list of entries, since it should in theory be the most recent and therefore most relevant
         * (from looking at a few texts it appears that in the old games there are \n at the end of short lines and \f for long ones)
         * (NOTE: replacing newlines with spaces causes an issue when the newline is in the middle of a word)
         */
        let description = pokemonSpeciesData
            .flavor_text_entries
            .findLast((text) => text.language.name === "en")
            ?.flavor_text
            ?.replace(/\n|\f/g, " ");

        let form_description = pokemonSpeciesData
            .form_descriptions
            .findLast((text) => text.language.name === "en")
            ?.description
            ?.replace(/\n|\f/g, " ");

        // update the descriptions
        POKEMON_MODAL.description.textContent = description;
        if (form_description != null) {
            POKEMON_MODAL.formDescription.classList.remove("d-none");
            POKEMON_MODAL.formDescription.textContent = form_description;
        } else {
            POKEMON_MODAL.formDescription.classList.add("d-none");
            POKEMON_MODAL.formDescription.textContent = "";
        }
    }

    /**
     * function updates the pokemon modal's gender rate bar based on json
     */
    function updatePokemonModalGenderRate() {
        let femaleRateSteps = pokemonSpeciesData.gender_rate;

        if (femaleRateSteps < 0 || femaleRateSteps > GENDER_RATE_STEP_COUNT) {
            POKEMON_MODAL.genderRateBar.female.node.style.width = 0;
            POKEMON_MODAL.genderRateBar.female.node.setAttribute("aria-valuenow", 0);

            POKEMON_MODAL.genderRateBar.male.node.style.width = 0;
            POKEMON_MODAL.genderRateBar.male.node.setAttribute("aria-valuenow", 0);

            return;
        }

        let maleRateSteps = GENDER_RATE_STEP_COUNT - femaleRateSteps;

        let femaleRate = femaleRateSteps * 100 / GENDER_RATE_STEP_COUNT;
        let maleRate = maleRateSteps * 100 / GENDER_RATE_STEP_COUNT;

        POKEMON_MODAL.genderRateBar.female.node.style.width = `${femaleRate}%`;
        POKEMON_MODAL.genderRateBar.female.node.setAttribute("aria-valuenow", femaleRate);
        POKEMON_MODAL.genderRateBar.female.text.textContent = `${femaleRate} %`;

        POKEMON_MODAL.genderRateBar.male.node.style.width = `${maleRate}%`;
        POKEMON_MODAL.genderRateBar.male.node.setAttribute("aria-valuenow", maleRate);
        POKEMON_MODAL.genderRateBar.male.text.textContent = `${maleRate} %`
    }

    /**
     * function updates the pokemon modal's generation based on json data
     */
    function updatePokemonModalGeneration() {
        POKEMON_MODAL.generation.textContent = toTitleRomanNumeralCase(pokemonSpeciesData.generation.name);
    }

    /**
     * function updates the pokemon modal's weight (in kg) based on json data
     */
    function updatePokemonModalWeight() {
        POKEMON_MODAL.weight.textContent = `${pokemonData.weight / 10} kg`;
    }

    /**
     * function updates the pokemon modal's weight (in m) based on json data
     */
    function updatePokemonModalHeight() {
        POKEMON_MODAL.height.textContent = `${pokemonData.height / 10} m`;
    }

    /**
     * function updates the pokemon modal's color details based on json data
     */
    function updatePokemonModalColor() {
        POKEMON_MODAL.color.textContent = toTitleCase(pokemonSpeciesData.color.name);
    }

    /**
     * function updates the pokemon modal's shape details based on json data
     */
    function updatePokemonModalShape() {
        POKEMON_MODAL.shape.textContent = toTitleCase(pokemonSpeciesData.shape.name);
    }

    /**
     * function updates the pokemon modal's abilities based on json data
     */
    function updatePokemonModalAbilities() {
        for (const POKEMON_ABILITY of POKEMON_MODAL.abilities.querySelectorAll("li")) {
            POKEMON_ABILITY.remove();
        }

        for (let ability of pokemonData.abilities) {
            let abilityName = toTitleCase(ability.ability.name);
            if (ability.is_hidden) {
                abilityName += " (hidden)";
            }

            const POKEMON_ABILITY = document.createElement("li");
            POKEMON_ABILITY.textContent = abilityName;
            POKEMON_MODAL.abilities.appendChild(POKEMON_ABILITY);
        }
    }

    /**
     * function updates the pokemon modal's moves based on json data
     */
    function updatePokemonModalMoves() {
        /**
         * function updates the moves listed in a node
         * @param {Element} movesList the node that holds the moves on the DOM
         * @param {string[]} moves an array of the names of the moves to add to the category
         */
        function updateMoveCategory(MOVES_LIST_CONTAINER, MOVES_LIST, moves) {
            for (const MOVE_NODE of MOVES_LIST.querySelectorAll("li")) {
                MOVE_NODE.remove();
            }
            if (moves.length === 0) {
                MOVES_LIST_CONTAINER.classList.add("d-none");
            } else {
                MOVES_LIST_CONTAINER.classList.remove("d-none");
                for (let move of moves) {
                    const MOVE_NODE = document.createElement("li");
                    MOVE_NODE.textContent = move;
                    MOVES_LIST.appendChild(MOVE_NODE);
                }
            }
        }
        
        // get the moves
        let { levelup_moves, machine_moves, breed_moves, tutor_moves, other_moves } = pokemonData.moves.reduce(
            (acc, move) => {
                // get the last move details, since it should be the most recent
                let details = move.version_group_details[move.version_group_details.length-1];
                let moveName = toTitleCase(move.move.name);
                switch (details.move_learn_method.name) {
                    case "level-up": acc.levelup_moves.push(`${moveName} - [lv.${details.level_learned_at}]`); break;
                    case "machine": acc.machine_moves.push(moveName); break;
                    case "egg": case "light-ball-egg": acc.breed_moves.push(moveName); break;
                    case "tutor": acc.tutor_moves.push(moveName); break;
                    default: acc.other_moves.push(moveName);
                }
                return acc;
            },
            { levelup_moves: [], machine_moves: [], breed_moves: [], tutor_moves: [], other_moves: [] }
        );

        // update the moves
        updateMoveCategory(POKEMON_MODAL.moves.levelup.node, POKEMON_MODAL.moves.levelup.list, levelup_moves);
        updateMoveCategory(POKEMON_MODAL.moves.breed.node, POKEMON_MODAL.moves.breed.list, breed_moves);
        updateMoveCategory(POKEMON_MODAL.moves.machine.node, POKEMON_MODAL.moves.machine.list, machine_moves);
        updateMoveCategory(POKEMON_MODAL.moves.tutor.node, POKEMON_MODAL.moves.tutor.list, tutor_moves);
        updateMoveCategory(POKEMON_MODAL.moves.other.node, POKEMON_MODAL.moves.other.list, other_moves);
    }

    /**
     * function updates the pokemon modal's base stats based on json data
     */
    function updatePokemonModalBaseStats() {
        // get the base stats
        let hp = 0;
        let attack = 0;
        let defense = 0;
        let spAttack = 0;
        let spDefense = 0;
        let speed = 0;
        for (let stat of pokemonData.stats) {
            switch (stat.stat.name) {
                case "hp": hp = stat.base_stat; break;
                case "attack": attack = stat.base_stat; break;
                case "defense": defense = stat.base_stat; break;
                case "special-attack": spAttack = stat.base_stat; break;
                case "special-defense": spDefense = stat.base_stat; break;
                case "speed": speed = stat.base_stat; break;
            }
        }

        // update the base stats
        // all base stats as of creating this are at most 255, which is why dividing by 2.55 each
        POKEMON_MODAL.baseStats.hp.node.setAttribute("aria-valuenow", hp);
        POKEMON_MODAL.baseStats.hp.bar.style.width = hp / 2.55 + "%";
        POKEMON_MODAL.baseStats.hp.bar.textContent = hp;

        POKEMON_MODAL.baseStats.attack.node.setAttribute("aria-valuenow", attack);
        POKEMON_MODAL.baseStats.attack.bar.style.width = attack / 2.55 + "%";
        POKEMON_MODAL.baseStats.attack.bar.textContent = attack;

        POKEMON_MODAL.baseStats.defense.node.setAttribute("aria-valuenow", defense);
        POKEMON_MODAL.baseStats.defense.bar.style.width = defense / 2.55 + "%";
        POKEMON_MODAL.baseStats.defense.bar.textContent = defense;

        POKEMON_MODAL.baseStats.spAttack.node.setAttribute("aria-valuenow", spAttack);
        POKEMON_MODAL.baseStats.spAttack.bar.style.width = spAttack / 2.55 + "%";
        POKEMON_MODAL.baseStats.spAttack.bar.textContent = spAttack;

        POKEMON_MODAL.baseStats.spDefense.node.setAttribute("aria-valuenow", spDefense);
        POKEMON_MODAL.baseStats.spDefense.bar.style.width = spDefense / 2.55 + "%";
        POKEMON_MODAL.baseStats.spDefense.bar.textContent = spDefense;
        
        POKEMON_MODAL.baseStats.speed.node.setAttribute("aria-valuenow", speed);
        POKEMON_MODAL.baseStats.speed.bar.style.width = speed / 2.55 + "%";
        POKEMON_MODAL.baseStats.speed.bar.textContent = speed;
    }

    /**
     * function update the pokemon modal's various pokemon forms based on json data
     */
    function updatePokemonModalForms() {
        /**
         * function creates a display that informs the pokemon is the only form in the species
         * @param {Element} PARENT_NODE  the parent node to append to
         * @param {string} name the name of the pokemon species
         */
        function createPokemonOnlyFormDisplay(PARENT_NODE, name) {
            const DISPLAY_NODE = document.createElement("p");
            DISPLAY_NODE.classList.add("m-0");
            DISPLAY_NODE.textContent = `This is ${name}'s only form`;
            PARENT_NODE.appendChild(DISPLAY_NODE);
        }
        
        /**
         * function creates an entry for a pokemon form and appends it to a parent node
         * @param {Element} PARENT_NODE the parent node to append to
         * @param {json} pokemonForm
         */
        function createPokemonForm(PARENT_NODE, pokemonForm) {
            let name = toPokemonFormName(pokemonData.name, pokemonForm.name);

            const BUTTON_CONTAINER = document.createElement("div");
            BUTTON_CONTAINER.classList.add("col");
            PARENT_NODE.appendChild(BUTTON_CONTAINER);

            const POKEMON_FORM_CONTAINER = document.createElement("button");
            POKEMON_FORM_CONTAINER.type = "button";
            POKEMON_FORM_CONTAINER.classList.add("btn", "btn-light", "w-100", "h-100");
            BUTTON_CONTAINER.appendChild(POKEMON_FORM_CONTAINER);
            
            const POKEMON_FORM_SPRITE = document.createElement("img");
            POKEMON_FORM_SPRITE.classList.add(POKEMON_FORM_SPRITE_CLASS);
            POKEMON_FORM_CONTAINER.appendChild(POKEMON_FORM_SPRITE);
            
            const POKEMON_FORM_NAME = document.createElement(POKEMON_MODAL_HEADING_LEVEL);
            POKEMON_FORM_NAME.classList.add("text-body");
            POKEMON_FORM_NAME.textContent = name;
            POKEMON_FORM_CONTAINER.appendChild(POKEMON_FORM_NAME);
            
            if (pokemonForm.name === pokemonFormData.name) {
                POKEMON_FORM_CONTAINER.classList.add("active");
                POKEMON_FORM_SPRITE.src = pokemonDefaultSprite.sprite;
                POKEMON_FORM_SPRITE.alt = `${pokemonForm.name} main sprite`;
                if (pokemonDefaultSprite.pixelated) {
                    POKEMON_FORM_SPRITE.classList.add("pixelated");
                } else {
                    POKEMON_FORM_SPRITE.classList.remove("pixelated");
                }

            } else {
                POKEMON_FORM_CONTAINER.addEventListener("click", () => {
                    focusPokemonForm(pokemonForm.url);
                }, { once: true }); // clicking reloads all the data, meaning this will be deleted and remade
                POKEMON_FORM_SPRITE.src = UNKNOWN_POKEMON_SPRITE;
                POKEMON_FORM_SPRITE.alt = `unknown sprite (${pokemonForm.name})`;
            }
        }

        for (const CONTAINER of POKEMON_MODAL.forms.querySelectorAll(`.${POKEMON_FORMS_CONTAINER_CLASS}`)) {
            CONTAINER.remove();
        }
        
        
        let forms = pokemonData.forms;
        if (forms.length === 1) {
            const POKEMON_FORMS_CONTAINER = document.createElement("div");
            POKEMON_FORMS_CONTAINER.classList.add(POKEMON_FORMS_CONTAINER_CLASS);
            POKEMON_MODAL.forms.appendChild(POKEMON_FORMS_CONTAINER);
            createPokemonOnlyFormDisplay(POKEMON_FORMS_CONTAINER, toTitleCase(forms[0].name));
        
        } else {
            const POKEMON_FORMS_CONTAINER = document.createElement("ul");
            POKEMON_FORMS_CONTAINER.classList.add(
                "container-fluid", "row", "row-cols-1", "row-cols-lg-2", "row-cols-xl-3", "row-cols-xxl-4", "g-2",
                "list-unstyled", "m-0", "p-0",
                POKEMON_FORMS_CONTAINER_CLASS
            );
            POKEMON_MODAL.forms.appendChild(POKEMON_FORMS_CONTAINER);
            
            for (let form of forms) {
                createPokemonForm(POKEMON_FORMS_CONTAINER, form);
            }
        }
    }

    /**
     * function update the pokemon modal's various pokemon varieties based on json data
     */
    function updatePokemonModalVarieties() {
        /**
         * function creates a display that informs the pokemon is the only variety in the species
         * @param {Element} PARENT_NODE  the parent node to append to
         * @param {string} name the name of the pokemon species
         */
        function createPokemonOnlyVarietyDisplay(PARENT_NODE, name) {
            const DISPLAY_NODE = document.createElement("p");
            DISPLAY_NODE.classList.add("m-0");
            DISPLAY_NODE.textContent = `This is the only variety in the ${name} species`;
            PARENT_NODE.appendChild(DISPLAY_NODE);
        }
        
        /**
         * function creates an entry for a pokemon variety and appends it to a parent node
         * @param {Element} PARENT_NODE the parent node to append to
         * @param {json} pokemon
         */
        function createPokemonVariety(PARENT_NODE, pokemon) {
            let name = toTitleCase(pokemon.name);

            const BUTTON_CONTAINER = document.createElement("div");
            BUTTON_CONTAINER.classList.add("col");
            PARENT_NODE.appendChild(BUTTON_CONTAINER);

            const POKEMON_VARIETY_CONTAINER = document.createElement("button");
            POKEMON_VARIETY_CONTAINER.type = "button";
            POKEMON_VARIETY_CONTAINER.classList.add("btn", "btn-light", "w-100", "h-100");
            BUTTON_CONTAINER.appendChild(POKEMON_VARIETY_CONTAINER);
            
            const POKEMON_VARIETY_SPRITE = document.createElement("img");
            POKEMON_VARIETY_SPRITE.classList.add(POKEMON_VARIETY_SPRITE_CLASS);
            POKEMON_VARIETY_CONTAINER.appendChild(POKEMON_VARIETY_SPRITE);
            
            const POKEMON_VARIETY_NAME = document.createElement(POKEMON_MODAL_HEADING_LEVEL);
            POKEMON_VARIETY_NAME.classList.add("text-body");
            POKEMON_VARIETY_NAME.textContent = name;
            POKEMON_VARIETY_CONTAINER.appendChild(POKEMON_VARIETY_NAME);
            
            if (pokemon.name === pokemonData.name) {
                POKEMON_VARIETY_CONTAINER.classList.add("active");
                POKEMON_VARIETY_SPRITE.src = pokemonDefaultSprite.sprite;
                POKEMON_VARIETY_SPRITE.alt = `${pokemon.name} main sprite`;
                if (pokemonDefaultSprite.pixelated) {
                    POKEMON_VARIETY_SPRITE.classList.add("pixelated");
                } else {
                    POKEMON_VARIETY_SPRITE.classList.remove("pixelated");
                }

            } else {
                POKEMON_VARIETY_CONTAINER.addEventListener("click", () => {
                    focusPokemon(pokemon.url);
                }, { once: true }); // clicking reloads all the data, meaning this will be deleted and remade
                POKEMON_VARIETY_SPRITE.src = UNKNOWN_POKEMON_SPRITE;
                POKEMON_VARIETY_SPRITE.alt = `unknown sprite (${pokemon.name})`;
            }
        }

        for (const CONTAINER of POKEMON_MODAL.varieties.querySelectorAll(`.${POKEMON_VARIETIES_CONTAINER_CLASS}`)) {
            CONTAINER.remove();
        }
        
        
        let varieties = pokemonSpeciesData.varieties;
        if (varieties.length === 1) {
            const POKEMON_VARIETIES_CONTAINER = document.createElement("div");
            POKEMON_VARIETIES_CONTAINER.classList.add(POKEMON_VARIETIES_CONTAINER_CLASS);
            POKEMON_MODAL.varieties.appendChild(POKEMON_VARIETIES_CONTAINER);
            createPokemonOnlyVarietyDisplay(POKEMON_VARIETIES_CONTAINER, toTitleCase(varieties[0].pokemon.name));
        
        } else {            
            const POKEMON_VARIETIES_CONTAINER = document.createElement("ul");
            POKEMON_VARIETIES_CONTAINER.classList.add(
                "container-fluid", "row", "row-cols-1", "row-cols-lg-2", "row-cols-xl-3", "row-cols-xxl-4", "g-2",
                "list-unstyled", "m-0", "p-0",
                POKEMON_VARIETIES_CONTAINER_CLASS
            );
            POKEMON_MODAL.varieties.appendChild(POKEMON_VARIETIES_CONTAINER);
            
            for (let variety of varieties) {
                createPokemonVariety(POKEMON_VARIETIES_CONTAINER, variety.pokemon);
            }
        }
    }

    /**
     * function updates the pokemon modal's evolution line based on json data
     */
    function updatePokemonEvolutionLine() {
        /**
         * function creates a display that informs the pokemon doesn't evolve
         * @param {Element} PARENT_NODE  the parent node to append to
         * @param {string} name the name of the pokemon
         */
        function createPokemonDoesntEvolveDisplay(PARENT_NODE, name) {
            const DISPLAY_NODE = document.createElement("p");
            DISPLAY_NODE.classList.add("m-0");
            DISPLAY_NODE.textContent = `${name} doesn't evolve`;
            PARENT_NODE.appendChild(DISPLAY_NODE);
        }
        
        /**
         * function creates an evolution line, calling itself recursively, and appends it to the parent node
         * @param {Element} PARENT_NODE the parent node to append to
         * @param {json} evolutionPokemon 
         * @param {boolean} hasPreviousEvolution true if there is a pokemon before in the evolution line, and needs a trigger arrow
         * @param {string} triggerDescriptionsHeight the CSS height to give the trigger descriptions
         */
        function createEvolutionPokemon(PARENT_NODE, evolutionPokemon, hasPreviousEvolution, triggerDescriptionsHeight) {
            /**
             * function creates an evolution trigger node based on json data and appends it to the evolution node
             * @param {Element} EVOLUTION_NODE the parent node to append to
             * @param {json} evolutionPokemon 
             */
            function createEvolutionTrigger(EVOLUTION_NODE, evolutionPokemon) {
                // container of evolution trigger, also defines bounding container for arrow
                const EVOLUTION_TRIGGER_CONTAINER = document.createElement("div");
                // only care x-direction alignment centered, since y-direction alignment of arrow done using bottom 0
                EVOLUTION_TRIGGER_CONTAINER.classList.add("position-relative", "d-flex", "flex-column", "align-items-center", "arrow-container");
                EVOLUTION_TRIGGER_CONTAINER.style.setProperty("--content-height", triggerDescriptionsHeight);
                EVOLUTION_NODE.appendChild(EVOLUTION_TRIGGER_CONTAINER);

                const EVOLUTION_TRIGGER = document.createElement("div");
                /*
                 * center the trigger descriptions
                 * space out so arrow head always at bottom
                 * relative so that arrow can be positioned absolutely
                 * keep height as large as continer allows, so that space-between adds as much space as possible
                 * bottom margins so that text doesn't overlap with arrow head
                 */
                EVOLUTION_TRIGGER.classList.add("d-flex", "flex-column", "justify-content-between", "align-items-center", "h-100", "mb-arrow");
                EVOLUTION_TRIGGER_CONTAINER.appendChild(EVOLUTION_TRIGGER);
                
                let hasOther = false; // if any triggers are of a form not checked below

                for (let evolutionDetails of evolutionPokemon.evolution_details) {
                    let evolutionDescription = [];

                    if (evolutionDetails.gender != null) {
                        if (evolutionDetails.gender === 1) { evolutionDescription.push("female"); }
                        else if (evolutionDetails.gender === 2) { evolutionDescription.push("male"); }
                    }
                    if (evolutionDetails.min_level != null) {
                        evolutionDescription.push(`lv.${evolutionDetails.min_level}`);
                    }
                    if (evolutionDetails.min_happiness != null) {
                        evolutionDescription.push(`happiness ${evolutionDetails.min_happiness}`);
                    }
                    if (evolutionDetails.min_beauty != null) {
                        evolutionDescription.push(`beauty ${evolutionDetails.min_beauty}`);
                    }
                    if (evolutionDetails.min_affection != null) {
                        evolutionDescription.push(`affection ${evolutionDetails.min_affection}`);
                    }
                    if (evolutionDetails.relative_physical_stats != null) {
                        if (evolutionDetails.relative_physical_stats === -1) {
                            evolutionDescription.push("attack < defense");
                        } else if (evolutionDetails.relative_physical_stats === 0) {
                            evolutionDescription.push("attack = defense");
                        } else if (evolutionDetails.relative_physical_stats === 1) {
                            evolutionDescription.push("attack > defense");
                        }
                    }
                    if (evolutionDetails.held_item != null) {
                        evolutionDescription.push(`hold ${toTitleCase(evolutionDetails.held_item.name)}`);
                    }
                    if (evolutionDetails.item != null) {
                        evolutionDescription.push(`use ${toTitleCase(evolutionDetails.item.name)}`);
                    }
                    if (evolutionDetails.known_move != null) {
                        evolutionDescription.push(`knows ${toTitleCase(evolutionDetails.known_move.name)}`);
                    }
                    if (evolutionDetails.known_move_type != null) {
                        evolutionDescription.push(`knows ${toTitleCase(evolutionDetails.known_move_type.name)} move`);
                    }
                    if (evolutionDetails.time_of_day != "") {
                        evolutionDescription.push(`${evolutionDetails.time_of_day}time`);
                    }
                    if (evolutionDetails.needs_overworld_rain) {
                        evolutionDescription.push("raining");
                    }
                    if (evolutionDetails.party_species != null) {
                        evolutionDescription.push(`${toTitleCase(evolutionDetails.party_species.name)} in party`);
                    }
                    if (evolutionDetails.party_type != null) {
                        evolutionDescription.push(`${toTitleCase(evolutionDetails.party_type.name)} in party`);
                    }
                    if (evolutionDetails.location != null) {
                        evolutionDescription.push(`at ${toTitleCase(evolutionDetails.location.name)}`);
                    }
                    if (evolutionDetails.trigger.name === "trade") {
                        if (evolutionDetails.trade_species != null) {
                            evolutionDescription.push(`trade with ${toTitleCase(evolutionDetails.trade_species.name)}`);
                        } else {
                            evolutionDescription.push("trade");
                        }
                    }

                    if (evolutionDescription.length > 0) {
                        const EVOLUTION_TRIGGER_DETAILS = document.createElement("div");
                        /*
                         * set the background to body color so show overtop arrow
                         * set line height short + margin at bottom so distinction between different details
                         * set z-index to show details overtop arrow
                         */
                        EVOLUTION_TRIGGER_DETAILS.classList.add("bg-body", "text-center", "lh-1", "mb-2", "z-overtop");
                        EVOLUTION_TRIGGER_DETAILS.textContent = evolutionDescription.join(" & ");;
                        EVOLUTION_TRIGGER.appendChild(EVOLUTION_TRIGGER_DETAILS);
                    } else {
                        hasOther = true;
                    }
                }
                
                // add an 'other' trigger if an other trigger was found or if there are no listed triggers
                if (evolutionPokemon.evolution_details.length === 0 || hasOther) {
                    const EVOLUTION_TRIGGER_DETAILS = document.createElement("div");
                    /*
                     * set the background to body color so show overtop arrow
                     * set line height short + margin at bottom so distinction between different details
                     * set z-index to show details overtop arrow
                     */
                    EVOLUTION_TRIGGER_DETAILS.classList.add("bg-body", "text-center", "lh-1", "mb-2", "z-overtop");
                    EVOLUTION_TRIGGER_DETAILS.textContent = "other";
                    EVOLUTION_TRIGGER.appendChild(EVOLUTION_TRIGGER_DETAILS);
                }
            }
            
            /**
             * function creates an evolution sprite with the given name and sprite path, and appends it to the evolution node
             * @param {Element} PARENT_NODE 
             * @param {string} name the name of the pokemon
             * @param {string} sprite a path to the sprite of the pokemon
             */
            function createEvolutionSprite(PARENT_NODE, evolutionPokemon) {
                let name = toTitleCase(evolutionPokemon.species.name);

                const EVOLUTION_SPRITE_CONTAINER = document.createElement("button");
                EVOLUTION_SPRITE_CONTAINER.type = "button";
                EVOLUTION_SPRITE_CONTAINER.classList.add("btn", "btn-light");
                PARENT_NODE.appendChild(EVOLUTION_SPRITE_CONTAINER);

                const EVOLUTION_SPRITE = document.createElement("img");
                EVOLUTION_SPRITE.classList.add(POKEMON_EVOLUTION_SPRITE_CLASS);
                EVOLUTION_SPRITE_CONTAINER.appendChild(EVOLUTION_SPRITE);

                const EVOLUTION_NAME = document.createElement(POKEMON_MODAL_HEADING_LEVEL);
                EVOLUTION_NAME.classList.add("text-body");
                EVOLUTION_NAME.textContent = name;
                EVOLUTION_SPRITE_CONTAINER.appendChild(EVOLUTION_NAME);

                if (evolutionPokemon.species.name === pokemonData.species.name) {
                    EVOLUTION_SPRITE_CONTAINER.classList.add("active");
                    EVOLUTION_SPRITE.src = pokemonDefaultSprite.sprite;
                    EVOLUTION_SPRITE.alt = `${evolutionPokemon.species.name} main sprite`;
                    if (pokemonDefaultSprite.pixelated) {
                        EVOLUTION_SPRITE.classList.add("pixelated");
                    } else {
                        EVOLUTION_SPRITE.classList.remove("pixelated");
                    }

                } else {
                    let pokemonSpeciesUrl = evolutionPokemon.species.url;
                    EVOLUTION_SPRITE_CONTAINER.addEventListener("click", () => {
                        focusPokemonSpecies(pokemonSpeciesUrl);
                    }, { once: true }); // clicking reloads all the data, meaning this will be deleted and remade
                    EVOLUTION_SPRITE.src = UNKNOWN_POKEMON_SPRITE;
                    EVOLUTION_SPRITE.alt = `unknown sprite (${evolutionPokemon.species.name})`;
                }
            }

            /**
             * function creates a next evolutions node based on json data, populating recursively,
             * and appends it to the evolution node
             * @param {Element} EVOLUTION_NODE the parent node to append to
             * @param {json} evolutionPokemon 
             */
            function createNextEvolutions(EVOLUTION_NODE, evolutionPokemon) {
                let triggerDescriptionsHeight = evolutionPokemon.evolves_to.reduce(
                    (acc, pokemon) => {
                        let detailsCount = pokemon.evolution_details.length;
                        return acc > detailsCount ? acc : detailsCount;
                    },
                    1 // min height of trigger arrow is 1
                ) * EVOLUTION_TRIGGER_DESCRIPTION_LINE_MULTIPLIER + "em";
                
                const NEXT_EVOLUTIONS_CONTAINER = document.createElement("div");
                /*
                 * padding so that borders don't overlap and evolution relations seeable on small screens,
                 * remove gutters to fix spacing
                 * add a gap between rows so that when content stacked, there is visible space to discern hierarchy
                 * add a full width to span the whole available width (could also be container-fluid, but functionality overwritten anyway)
                 */
                NEXT_EVOLUTIONS_CONTAINER.classList.add("row", "border", "p-1", "g-0", "row-gap-5", "w-100", "mt-arrow");
                EVOLUTION_NODE.appendChild(NEXT_EVOLUTIONS_CONTAINER);

                for (let pokemon of evolutionPokemon.evolves_to) {
                    createEvolutionPokemon(NEXT_EVOLUTIONS_CONTAINER, pokemon, true, triggerDescriptionsHeight);
                }
            }

            if (evolutionPokemon == null) { return; }
            
            const EVOLUTION_POKEMON_NODE = document.createElement("div");
            EVOLUTION_POKEMON_NODE.classList.add("col", "d-flex", "flex-column", "align-items-center");
            PARENT_NODE.appendChild(EVOLUTION_POKEMON_NODE);

            // only create the trigger if this pokemon has a pokemon before in the evolution chain
            if (hasPreviousEvolution) {
                createEvolutionTrigger(EVOLUTION_POKEMON_NODE, evolutionPokemon);
            }

            createEvolutionSprite(EVOLUTION_POKEMON_NODE, evolutionPokemon);
            
            // only create the next evolutions this is not the last pokemon in the evolution chain
            if (evolutionPokemon.evolves_to.length > 0) {
                createNextEvolutions(EVOLUTION_POKEMON_NODE, evolutionPokemon);
            }
        }
        
        let evolutionPokemon = pokemonEvolutionData.chain;

        for (const CONTAINER of POKEMON_MODAL.evolutions.querySelectorAll(`.${POKEMON_EVOLUTION_CONTAINER_CLASS}`)) {
            CONTAINER.remove();
        }

        const POKEMON_EVOLUTION_CONTAINER = document.createElement("div");
        POKEMON_EVOLUTION_CONTAINER.classList.add(POKEMON_EVOLUTION_CONTAINER_CLASS);
        POKEMON_MODAL.evolutions.appendChild(POKEMON_EVOLUTION_CONTAINER);

        if (evolutionPokemon.evolves_to.length === 0) {
            createPokemonDoesntEvolveDisplay(POKEMON_EVOLUTION_CONTAINER, toTitleCase(evolutionPokemon.species.name));
        } else {
            createEvolutionPokemon(POKEMON_EVOLUTION_CONTAINER, evolutionPokemon, false, "0");
        }
    }


    //#endregion

    //////////////////////////////
    //#region POKEMON FAVORITES //
    ////////////////////////////////////////////////////////////////////////////////////////////////////


    // CONSTANTS //


    const FAVORITE_POKEMONS_STORAGE_KEY = "favorite-pokemons";
    // the class placed on the favorite button on pokemon cards
    const POKEMON_FAVORITE_BUTTON_CLASS = "pokemon-favorite-button";
    // the class that styles the button as favorited
    const FAVORITED_CLASS = "favorited";


    // VARIABLES //


    // a list of favorited pokemon, stored in session storage so as to persist after reload
    let favoritePokemons = JSON.parse(sessionStorage.getItem(FAVORITE_POKEMONS_STORAGE_KEY)) || [];


    // FUNCTIONS //


    /**
     * function gets the index of the pokemon in the list of favorites, or -1 if not present
     * @param {string} pokemonUrl the URL to the pokemon's API
     * @returns the pokemon's index in the favorites list
     */
    function getFavoriteIndex(pokemonUrl) {
        return favoritePokemons.findIndex(favoritePokemon => favoritePokemon.url === pokemonUrl);
    }

    /**
     * function adds a pokemon to the favorites list, updating the session storage
     * @param {json} pokemon 
     */
    function addFavoritePokemon(pokemon) {
        favoritePokemons.push(pokemon);
        sessionStorage.setItem(FAVORITE_POKEMONS_STORAGE_KEY, JSON.stringify(favoritePokemons));
    }

    /**
     * function removes the pokemon stored at a certain index of the favorites list, updating the session storage
     * @param {number} favoriteIndex 
     */
    function removeFavoritePokemon(favoriteIndex) {
        favoritePokemons.splice(favoriteIndex, 1);
        sessionStorage.setItem(FAVORITE_POKEMONS_STORAGE_KEY, JSON.stringify(favoritePokemons));
    }

    function favoriteFavoriteButton(FAVORITE_BUTTON) {
        FAVORITE_BUTTON.classList.add(FAVORITED_CLASS);
        FAVORITE_BUTTON.textContent = "favorited";
    }

    function unfavoriteFavoriteButton(FAVORITE_BUTTON) {
        FAVORITE_BUTTON.classList.remove(FAVORITED_CLASS);
        FAVORITE_BUTTON.textContent = "favorite";
    }


    //#endregion

    ////////////////////
    //#region STARTUP //
    ////////////////////////////////////////////////////////////////////////////////////////////////////


    // at startup, configure the pagination
    configurePagination();
    configureUpdatePagesInPaginationFromViewportSize();
    configureCardsPerPageSelect();

    // at startup, configure the pokemon filters in the search and store the names of the form checkboxes
    configurePokemonSearchMatchPatternsSelect();
    const TYPE_NAMES = await configurePokemonTypesFilter();
    const GENERATION_NAMES = await configurePokemonGenerationsFilter();
    const COLOR_NAMES = await configurePokemonColorsFilter();
    const SHAPE_NAMES = await configurePokemonShapesFilter();
    configureSearchFavorites();

    // at startup, load empty pokemon cards into the DOM to be populated later
    for (let i = 0; i < cardsPerPage; i++) {
        createHiddenPokemonCard(i);
    }

    // at startup, configure the pokemon modal's favorite button to toggle pokemon favorites
    configurePokemonFavoriteButton();

    // when a search is submitted, search for the matching pokemon
    SEARCH_FORM.node.addEventListener("submit", (event) => {       
        event.preventDefault();
        searchPokemon();
    });


    //#endregion

}, { once: true });


// taken from https://github.com/twbs/bootstrap/issues/41005 [2]
window.addEventListener('hide.bs.modal', () => {
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
});