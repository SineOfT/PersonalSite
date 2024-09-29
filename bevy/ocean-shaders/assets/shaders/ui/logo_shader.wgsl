#import bevy_ui::ui_vertex_output::UiVertexOutput

#import "shaders/util_functions.wgsl"::{remap, remap_2d, overlay, rotation_mat2x2}


const PI = 3.14f;
const TAU = 6.28f;
const EPSILON = 0.0001f;

const ANIMATION_DURATION = 3f;

const TEXT_PADDING = vec2(0.05f, 0.1f);
const LINE_GAP = 0.02f;
const BOTTOM_RIGHT = vec2(1f) - TEXT_PADDING;

const GAME_CREATIONS_TEXT_SIZE = vec2(0.6f, 0.0619308f);
const SINE_OF_T_TEXT_SIZE = vec2(0.5f, 0.089256f);

const GAME_CREATIONS_TEXT_POSITION = vec2(
    BOTTOM_RIGHT.x - GAME_CREATIONS_TEXT_SIZE.x,
    BOTTOM_RIGHT.y - GAME_CREATIONS_TEXT_SIZE.y
);
const SINE_OF_T_TEXT_POSITION = vec2(
    BOTTOM_RIGHT.x - SINE_OF_T_TEXT_SIZE.x,
    GAME_CREATIONS_TEXT_POSITION.y - SINE_OF_T_TEXT_SIZE.y - LINE_GAP
);

const SINE_OF_T_FADE_T = 0.4f;
const GAME_CREATIONS_FADE_T = 0.6f;
const FADE_DURATION = 0.3f;

const SKY_COLOR = vec4(0.1f, 0.5f, 1f, 1f);
const WAVE_COLOR = vec4(0.05f, 0.2f, 0.7f, 1f);
const FISH_COLOR = vec4(1f, 0.15f, 0.05f, 1f);
const BLUSH_COLOR = vec4(1f, 0.5f, 0.7f, 1f);

const SKY_SIZE = 0.9f;
const SKY_CORNER_RADIUS = 0.2f;

const WAVE_SAMPLE_MULTIPLIER = 10f;
const WAVE_AMPLITUDE = 0.03f;
const WAVE_FREQUENCY = 2f;
const WAVE_OFFSET = -0.6f;
const WAVE_TOP = 0.6f;
const WAVE_CORNER_RADIUS = 0.2f;

const SPLASH_SIZE = 0.1f;
const SPLASH_WIDTH = 0.25f;
const SPLASH_RADIUS = 0.1f;
const SPLASH_DEPTH = 0.01f;
const SPLASH_MAX_ROTATION = 2f;
const SPLASH_DURATION = 0.13f;
const EXIT_SPLASH_T = 0.13237f;
const ENTER_SPLASH_T = 0.86763f;
const EXIT_SPLASH_ORIGIN = vec2(FISH_JUMP_ORIGIN.x + FISH_JUMP_RADIUS, WAVE_TOP + WAVE_AMPLITUDE + SPLASH_DEPTH);
const ENTER_SPLASH_ORIGIN = vec2(FISH_JUMP_ORIGIN.x - FISH_JUMP_RADIUS, WAVE_TOP + WAVE_AMPLITUDE + SPLASH_DEPTH);

const FISH_SIZE = vec2(0.2f, 0.15f);
const FISH_ORIGIN = vec2(0f, 0.5f);
const FISH_CENTER_FROM_ORIGIN = vec2(0.5f, 0f);
const FISH_JUMP_ORIGIN = vec2(0.5f, WAVE_TOP);
const FISH_JUMP_RADIUS = -0.25f;

const TAIL_SIZE = vec2(0.5f, 0.9f);
const TAIL_SPEED_DELTA_COEFFICIENT = 1.5f;
const TAIL_ROTATE_SPEED = 10f;
const TAIL_MAX_ANGLE = 0.2f;

const EYE_POSITION = vec2(0.4f, -0.2f);
const EYE_RADIUS = 0.3f;
const HIGHLIGHT_POSITION = vec2(0f, -0.5f);
const HIGHLIGHT_RADIUS = 0.5f;
const SMILE_EYE_HEIGHT = 0.3f;
const SMILE_EYE_CURVE = -1f;

const BLUSH_POSITION = vec2(0.1f, 0f);
const BLUSH_SIZE = vec2(0.2f, 0.1f);

const SMILE_T = 0.25f;
const SMILE_DURATION = 0.4f;
const SMILE_DEGREE_STEEPNESS = 5f;


struct Variables {
    alpha: f32,
    animation_t: f32,
    padding: vec2<u32>
}

@group(1) @binding(0) var<uniform> variables: Variables;
@group(1) @binding(1) var sine_of_t_text: texture_2d<f32>;
@group(1) @binding(2) var sine_of_t_sampler: sampler; 
@group(1) @binding(3) var game_creations_text: texture_2d<f32>;
@group(1) @binding(4) var game_creations_sampler: sampler; 


fn remap_t(t_start: f32, duration: f32, t: f32) -> f32 {
    return saturate(remap(t_start, t_start + duration, 0f, 1f, t));
}

fn rounded_edge_alpha(center: vec2<f32>, radius: f32) -> f32 {
    let position_from_edge = vec2(
        saturate(abs(center.x) - (1f-radius)),
        saturate(abs(center.y) - (1f-radius))
    ) / radius;
    return (1f-step(1f, dot(position_from_edge, position_from_edge)));
}

fn calculate_sky_texture(uv: vec2<f32>, animation_t: f32) -> vec4<f32> {
    let center = remap_2d(0f, 1f, -1f, 1f, uv) / SKY_SIZE;
    return vec4(
        SKY_COLOR.rgb,
        SKY_COLOR.a * rounded_edge_alpha(center, SKY_CORNER_RADIUS)
    );
}

fn calculate_wave_texture(uv: vec2<f32>, animation_t: f32) -> vec4<f32> {
    let center = remap_2d(0f, 1f, -1f, 1f, uv);

    let offset = (animation_t * TAU + WAVE_OFFSET) * WAVE_FREQUENCY;
    return vec4(
        WAVE_COLOR.rgb,
        WAVE_COLOR.a
            * step(WAVE_TOP, uv.y + sin(uv.x * WAVE_SAMPLE_MULTIPLIER + offset) * WAVE_AMPLITUDE)
            * rounded_edge_alpha(center, WAVE_CORNER_RADIUS)
    );
}

fn calculate_splash_alpha(uv: vec2<f32>, splash_t: f32, origin: vec2<f32>, direction: f32) -> f32 {
    let angle = sin(splash_t * PI/2f) * SPLASH_MAX_ROTATION * direction;
    let scale = sin(splash_t * PI) + EPSILON;
    let splash_position = (
        rotation_mat2x2(angle) * (uv - origin - vec2(SPLASH_RADIUS * direction, 0f)) + vec2(SPLASH_RADIUS * direction, 0f)
    ) / SPLASH_SIZE / scale;
    let polar_angle = atan2(splash_position.x, -splash_position.y);
    let mask_dist_squared = remap(-1f, 1f, 0f, 1f, cos(polar_angle / SPLASH_WIDTH)) * step(-PI * SPLASH_WIDTH, polar_angle) * (1f-step(PI * SPLASH_WIDTH, polar_angle));
    return 1f-step(mask_dist_squared, dot(splash_position, splash_position));
}
fn calculate_splash_texture(uv: vec2<f32>, animation_t: f32) -> vec4<f32> {
    let exit_splash_t = remap_t(EXIT_SPLASH_T, SPLASH_DURATION, animation_t);
    let enter_splash_t = remap_t(ENTER_SPLASH_T, SPLASH_DURATION, animation_t);

    var alpha = 0f;
    alpha += calculate_splash_alpha(uv, exit_splash_t, EXIT_SPLASH_ORIGIN, -1f);
    alpha += calculate_splash_alpha(uv, exit_splash_t, EXIT_SPLASH_ORIGIN,  1f);
    alpha += calculate_splash_alpha(uv, enter_splash_t, ENTER_SPLASH_ORIGIN, -1f);
    alpha += calculate_splash_alpha(uv, enter_splash_t, ENTER_SPLASH_ORIGIN,  1f);
    alpha = saturate(alpha);

    return vec4(
        WAVE_COLOR.rgb,
        WAVE_COLOR.a * alpha
    );
}

fn calculate_smile_degree(smile_t: f32) -> f32 {
    return saturate((-abs(smile_t - 0.5f) + 0.5f) * SMILE_DEGREE_STEEPNESS);
}
fn calculate_eye_texture(fish_position: vec2<f32>, smile_degree: f32) -> vec4<f32> {
    let eye_size = EYE_RADIUS * vec2(1f, mix(1f, SMILE_EYE_HEIGHT, smile_degree));
    var eye_position = (fish_position * vec2(FISH_SIZE.x/FISH_SIZE.y, 1f) + EYE_POSITION) / eye_size;
    eye_position.y += cos(eye_position.x * PI/2f) * SMILE_EYE_CURVE * smile_degree;

    let highlight_radius = HIGHLIGHT_RADIUS * (1f-smile_degree) + EPSILON;
    let highlight_position = (eye_position + HIGHLIGHT_POSITION) / highlight_radius;

    var eye_texture = vec4(0f);
    eye_texture = mix(eye_texture, vec4(vec3(0f), 1f), 1f-step(1f, dot(eye_position, eye_position)));
    eye_texture = mix(eye_texture, vec4(1f), 1f-step(1f, dot(highlight_position, highlight_position)));

    return eye_texture;
}
fn calculate_blush_texture(fish_position: vec2<f32>, smile_degree: f32) -> vec4<f32> {
    let blush_size = BLUSH_SIZE * smile_degree + EPSILON;
    let blush_position = (fish_position * vec2(FISH_SIZE.x/FISH_SIZE.y, 1f) + BLUSH_POSITION) / blush_size;
    return mix(vec4(0f), BLUSH_COLOR, 1f-step(1f, dot(blush_position, blush_position)));
}
fn calculate_fish_texture(uv: vec2<f32>, animation_t: f32) -> vec4<f32> {
    let smile_t = remap_t(SMILE_T, SMILE_DURATION, animation_t);
    let smile_degree = calculate_smile_degree(smile_t);
    
    let fish_angle = sin(animation_t * TAU) + animation_t * TAU;
    let tail_angle = sin(
        ((-cos(animation_t * TAU) + 2f) / TAIL_SPEED_DELTA_COEFFICIENT + animation_t * TAU) * TAIL_ROTATE_SPEED
    ) * TAIL_MAX_ANGLE;

    let fish_position = remap_2d(0f, 1f, -1f, 1f, (
        rotation_mat2x2(fish_angle) * (uv - FISH_JUMP_ORIGIN) + vec2(0f, FISH_JUMP_RADIUS)
    ) / FISH_SIZE + FISH_ORIGIN);
    let tail_position = rotation_mat2x2(tail_angle) * (fish_position + vec2(-1f, 0f)) / TAIL_SIZE;
    
    let tail_polar_angle = atan2(tail_position.y, tail_position.x);

    var fish_alpha = 0f;
    fish_alpha += 1f-step(1f, dot(fish_position, fish_position));
    fish_alpha += 1f-step(remap(-1f, 1f, 0.5f, 1f, -cos(3f * tail_polar_angle)), dot(tail_position, tail_position));
    fish_alpha = saturate(fish_alpha);

    let eye_texture = calculate_eye_texture(fish_position, smile_degree);
    let blush_texture = calculate_blush_texture(fish_position, smile_degree);

    var fish_texture = vec4(FISH_COLOR.rgb, FISH_COLOR.a * fish_alpha);
    fish_texture = overlay(fish_texture, eye_texture);
    fish_texture = overlay(fish_texture, blush_texture);
   
   return fish_texture;
}

fn calculate_text_texture(uv: vec2<f32>, continuous_animation_t: f32) -> vec4<f32> {
    let sine_of_t_fade_t = remap_t(SINE_OF_T_FADE_T, FADE_DURATION, continuous_animation_t);
    let sine_of_t_text_uv = (uv - SINE_OF_T_TEXT_POSITION) / SINE_OF_T_TEXT_SIZE;
    var sine_of_t_text_texture = textureSample(sine_of_t_text, sine_of_t_sampler, sine_of_t_text_uv);
    sine_of_t_text_texture.a *= sine_of_t_fade_t;

    let game_creations_fade_t = remap_t(GAME_CREATIONS_FADE_T, FADE_DURATION, continuous_animation_t);
    let game_creations_text_uv = (uv - GAME_CREATIONS_TEXT_POSITION) / GAME_CREATIONS_TEXT_SIZE; 
    var game_creations_text_texture = textureSample(game_creations_text, game_creations_sampler, game_creations_text_uv);
    game_creations_text_texture.a *= game_creations_fade_t;

    return sine_of_t_text_texture + game_creations_text_texture;
}


@fragment fn fragment(in: UiVertexOutput) -> @location(0) vec4<f32> {
    let modular_animation_t = fract(variables.animation_t);

    let sky_texture = calculate_sky_texture(in.uv, modular_animation_t);
    let fish_texture = calculate_fish_texture(in.uv, modular_animation_t);
    let splash_texture = calculate_splash_texture(in.uv, modular_animation_t);
    let wave_texture = calculate_wave_texture(in.uv, modular_animation_t);
    let text_texture = calculate_text_texture(in.uv, variables.animation_t);

    var logo_color = vec4(0f);
    logo_color = overlay(logo_color, sky_texture);
    logo_color = overlay(logo_color, fish_texture);
    logo_color = overlay(logo_color, splash_texture);
    logo_color = overlay(logo_color, wave_texture);
    logo_color = overlay(logo_color, text_texture);
    logo_color.a *= variables.alpha;
    return logo_color;
}