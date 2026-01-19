# Task Generator

This website was made to easily generate YAML for [Home Assistant](https://www.home-assistant.io/) to keep track of my household chores.

## Context

I'm currently using Home Assistant to automate and manage my home. I wanted a way to track when chores were last done, how often they should be done, and whether they are overdue. I found myself creating similar sets of helpers (like `input_datetime`, `input_number`, etc.) for each chore, which was repetitive and prone to errors.

This tool streamlines the process by generating the necessary YAML configuration based on a few simple inputs. It creates all the entities needed to track a single chore, including sensors to calculate days since last done and overdue status.

When using this website, the following fields get stored to `localStorage` for your convenience:

-   Task Name
-   ID Prefix
-   Interval (days)
-   Icon
-   Chore Message
