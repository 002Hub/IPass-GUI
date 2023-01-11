use winit::{
    event::{Event, WindowEvent},
    event_loop::EventLoop,
    window::WindowBuilder,
};

extern crate ip_lib;

fn main() {

    let ver = option_env!("CARGO_PKG_VERSION").unwrap_or("x.x.x");

    let event_loop = EventLoop::new();

    WindowBuilder::new()
    .with_title(format!("IPass - {ver}"))
    .build(&event_loop).expect("Expected to create window");

    event_loop.run(move |event, _, control_flow| {

        control_flow.set_wait();

        match event {
            Event::WindowEvent {
                event: WindowEvent::CloseRequested,
                ..
            } => {
                println!("The close button was pressed; stopping");
                control_flow.set_exit();
            },
            Event::RedrawRequested(_) => {
                //TODO: redraw application
            },
            _ => (),
        }
    });
}