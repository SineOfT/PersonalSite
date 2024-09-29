#import bevy_sprite::mesh2d_functions::{mesh2d_position_local_to_clip, get_world_from_local}


struct Vertex {
    @builtin(instance_index) instance_index: u32,
    @location(0) position: vec3<f32>,
    @location(1) uv: vec2<f32>,
#ifdef HAS_SCALE
    @location(2) scale: vec2<f32>,
#endif
}

struct VertexOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) position: vec2<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) scale: vec2<f32>
}

@vertex fn vertex(vertex: Vertex) -> VertexOutput {
    var out: VertexOutput;
    out.clip_position = mesh2d_position_local_to_clip(
        get_world_from_local(vertex.instance_index),
        vec4(vertex.position, 1f)
    );
    out.position = vertex.position.xy;
    out.uv = vertex.uv;

#ifdef FLIP_X
    out.position.x *= -1f;
    out.uv.x = 1f - out.uv.x;
#endif

#ifdef FLIP_Y
    out.position.y *= -1f;
    out.uv.y = 1f - out.uv.y;
#endif


#ifdef HAS_SCALE
    out.position *= vertex.scale;
    out.scale = vertex.scale;
#endif

    return out;
}
