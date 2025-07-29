# Syncthing Manager

This website was made to easily manage my volumes that I put in my Docker compose file for Syncthing.

## Context

I'm currently using [Syncthing](https://syncthing.net/) to share music with my friends _(you should try it, it's fun!)_. I'm currently using my homelab server to host the files and share it with them. I want to share my music too, but they're all stored in a separate location. The best way I can choose what music I want to share without having to make duplicates of albums in my library is to treat each album I want to share as a volume mounted in the container. It sucks having to type out each line of album I want to copy since it's prone to error and could fuck up syncing stuff to my friends. I lessen my workload by just sending a text file to this website and it'll generate the Docker compose file for me.

I may update this some time and make it general purpose, but currently it's kinda hardcoded to sharing between two libraries with some environment variable names that are also hardcoded. Maybe there's a better solution to my problem mentioned above and what I'm doing is really stupid. I don't know, but what I _do_ know is that it works 😎

When using this website, the following fields gets stored to `localStorage`:

-   PUID
-   PGID
-   Timezone
-   Config Path
-   Shared Libraries Path
