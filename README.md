# ITag MQTT Dispatch

This project was greatly inspired by tomasgatials itag-mqtt-bridge https://github.com/tomasgatial/itag-mqtt-bridge. Im very happy that i stumbled upon that piece of software, i realized how versatile languade node really is.

Sadly my OPI2 Zero is giving me hard time and for some reason i cannot connect to my iTags with Noble library. Luckily i can still passively listen, so i repurposed the original project. 
With this, home assistant sees iTags as location_tracker entities and they can be attached to persons to indicate are they home or not. Home assistant auto-discovery is also available. 
