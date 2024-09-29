#import noisy_bevy::simplex_noise_2d

#import "shaders/util_functions.wgsl"::{remap, rand_2d}


const MAX_VALUE = 99999f;
const MIN_DISTANCE_MULTIPLIER = 0.25f;

const HIGHLIGHT_CELL_SIZE = vec2(0.3f, 0.3f);
const HIGHLIGHT_FALLOFF = 0.1f;


struct HighlightTextureVariables {
    depths: vec3<f32>,
    padding: u32
}


@group(2) @binding(100) var<uniform> variables: HighlightTextureVariables;


fn get_cell_position_seed(cell_position: vec2<f32>) -> f32 { return rand_2d(cell_position) * 20830f; }

fn get_feature(cell_position: vec2<f32>) -> vec3<f32> {
    let seed = get_cell_position_seed(cell_position);
    return vec3(
        cell_position + vec2(
            simplex_noise_2d(vec2(variables.depths.x, seed)) / 2f,
            simplex_noise_2d(vec2(variables.depths.y, seed)) / 2f
        ),
        remap(-1f, 1f, MIN_DISTANCE_MULTIPLIER, 1f, simplex_noise_2d(vec2(variables.depths.z, seed)))
    );
}

fn update_closest_distances(
    closest_distances: vec4<f32>,
    noise_position: vec2<f32>,
    cell_position: vec2<f32>
) -> vec4<f32> {

    let feature = get_feature(cell_position);
    let distance = vec2(distance(noise_position, feature.xy), feature.z);

    let is_closest = step(0f, closest_distances.x * closest_distances.y - distance.x * distance.y);
    let is_second_closest = step(0f, closest_distances.z * closest_distances.w - distance.x * distance.y);

    return vec4(
        mix(closest_distances.xy, distance, is_closest),
        mix(mix(closest_distances.zw, distance, is_second_closest), closest_distances.xy, is_closest),
    );
}

fn calculate_highlight_texture(input_position: vec2<f32>, color: vec4<f32>) -> vec4<f32> {
    var noise_position = input_position / HIGHLIGHT_CELL_SIZE;
    let cell_position = floor(noise_position + vec2(0.5f));

    var closest_distances = vec4(MAX_VALUE, 1f, MAX_VALUE, 1f);
    closest_distances = update_closest_distances(closest_distances, noise_position, cell_position);
    closest_distances = update_closest_distances(closest_distances, noise_position, cell_position + vec2( 0f,  1f));
    closest_distances = update_closest_distances(closest_distances, noise_position, cell_position + vec2( 1f,  1f));
    closest_distances = update_closest_distances(closest_distances, noise_position, cell_position + vec2( 1f,  0f));
    closest_distances = update_closest_distances(closest_distances, noise_position, cell_position + vec2( 1f, -1f));
    closest_distances = update_closest_distances(closest_distances, noise_position, cell_position + vec2( 0f, -1f));
    closest_distances = update_closest_distances(closest_distances, noise_position, cell_position + vec2(-1f, -1f));
    closest_distances = update_closest_distances(closest_distances, noise_position, cell_position + vec2(-1f,  0f));
    closest_distances = update_closest_distances(closest_distances, noise_position, cell_position + vec2(-1f,  1f));

    let closests_difference = (closest_distances.z * closest_distances.w - closest_distances.x * closest_distances.y)
        / (closest_distances.w + closest_distances.y);

    var highlight_texture = color;
    highlight_texture.a *= smoothstep(HIGHLIGHT_FALLOFF, 0f, closests_difference);

    return highlight_texture;
}