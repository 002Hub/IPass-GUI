use winit::{
    event::{Event, WindowEvent},
    event_loop::{ControlFlow, EventLoop},
    window::WindowBuilder,
};

extern crate ip_lib;

fn main() {

    let ver = option_env!("CARGO_PKG_VERSION").unwrap_or("x.x.x");

    let event_loop = EventLoop::new();
    let window = WindowBuilder::new()
    .with_title(format!("IPass - {ver}"))
    .build(&event_loop).expect("Expected to create window");

    event_loop.run(move |event, _, control_flow| {
        *control_flow = ControlFlow::Wait;

        match event {
            Event::WindowEvent {
                event: WindowEvent::CloseRequested,
                window_id,
            } if window_id == window.id() => *control_flow = ControlFlow::Exit,
            _ => (),
        }
    });
}