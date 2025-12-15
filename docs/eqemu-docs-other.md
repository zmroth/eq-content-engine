# EQEmu Documentation: Other

> Extracted from docs.eqemu.dev - 17 pages

---

## Welcome

*Source: .html*

# Welcome¶

Welcome to the **EverQuest Emulator Server** community docs!

Everything you need can be found by using **search** as well as the left and top nav menus!

Info

If you see anything that is missing or could be improved, please feel free to contribute and feel free to submit pull requests! Merged pull requests immediately publish to these docs.

The information presented represents the commitment of countless hours of coding and documentation by a large, passionate, open-source community.

The breadth of information compiled in the documentation is the accumulation of open source community members dating back to early 2000's.

The purpose of this platform is to allow a scalable transfer of knowledge and information regarding this massive project.

## EverQuest Emulator Server¶

**EverQuest Emulator Server is a custom, completely from-scratch reverse-engineered open source server implementation
for EverQuest built mostly on C / C++**

Features

- **Storage Engine** MySQL / MariaDB is used as the database engine (over 200+ tables)

- **Scripting Engine(s)** Perl and LUA are both supported scripting languages for NPC/Player/Quest oriented events

- **Game Content** Open source database (Project EQ) has content up to expansion OoW (included in server installs)

- Game server environments and databases can be heavily customized to create all new experiences

- Hundreds of Quests and events created and maintained by Project EQ

## Supported Clients¶

| 

Titanium Edition 
| Secrets of Faydwer 
| Seeds of Destruction 
| Underfoot 
| Rain of Fear (Most used) 

| 
| 
| 
| 
| 

## Server Installation¶

| 

Page 
| Platform 
| Description 
| Install Count 

| Server Installation (Windows) 
| Windows 
| A guide for installing EQEmu Server on Windows 
| 

| Server Installation (Linux) 
| Linux (Debian / Ubuntu) Preferred (Redhat / CentOS / Fedora supported) 
| A guide for installing EQEmu Server on Linux 
| 

| AkkStack (Docker) (Advanced) 
| Docker (Compose) 
| Containerized EverQuest Emulator Server Environment 
| 

| Dev container (Docker) (Advanced) 
| Docker 
| Development Environment in Vscode 
| - 

## Community¶

Find us on Discord!

## Bug Reports¶

- Please use the issue tracker provided by GitHub to send us bug reports or
 feature requests.

- Discord is also a place to get more immediate help from community members on
 troubleshooting

## External Resource links¶

| 

Page 
| Link 

| EQEmulator Website 
| http://www.eqemulator.org 

| EQEmu Server GitHub Repository 
| https://github.com/EQEmu/Server 

| Quest Scripts 
| https://github.com/ProjectEQ/projecteqquests 

| Plugins 
| https://github.com/ProjectEQ/projecteqquests/tree/master/plugins 

| Maps 
| https://github.com/EQEmuTools/eqemu-maps 

| Installer Resources 
| https://github.com/EQEmuTools/eqemu-install-v2 

| ProjectEQ (PEQ) Database 
| http://db.projecteq.net 

## Additional / Alternative Quest Script Repositories¶

| 

Description 
| Link 

| Project 2002 - Classic through POP quests in Lua 
| p2002 Quests

---

## Installation

*Source: akk-stack/installation/index.html*

# Installation¶

## Pre-requisites¶

### Install Docker¶

It doesn't matter what Linux OS you use as long as it has **Docker** and **Docker Compose**, my personal recommendation is **Debian**.

- Install Docker

- Install docker compose (listed below)

- Follow the instructions to run Docker as a non-root user

Warning

Do not run Docker as root, run docker as the user you are logged in as and add your user to the `docker` group

### Installing Docker Compose¶

```
`sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose
`
```

Confirm that it's working

```
`docker-compose -v
Docker Compose version v2.2.3
`
```

## Installing Akk-Stack¶

First clone the repository somewhere on your server, in this case I'm going to clone it to an `/opt/eqemu-servers` folder in a Debian Linux host with Docker installed

```
`git clone https://github.com/EQEmuTools/akk-stack.git && cd akk-stack
`
```

```
`$ git clone https://github.com/EQEmuTools/akk-stack.git
Cloning into 'akk-stack'...
remote: Enumerating objects: 57, done.
remote: Counting objects: 100% (57/57), done.
remote: Compressing objects: 100% (42/42), done.
remote: Total 782 (delta 14), reused 52 (delta 11), pack-reused 725
Receiving objects: 100% (782/782), 101.94 KiB | 7.28 MiB/s, done.
Resolving deltas: 100% (437/437), done.
`
```

### Initialize the Environment¶

There are a ton of configuration variables available in the **.env** file that is produced from running the next command, we will get into that later. The key thing here is that it creates the base **.env** and scrambles all of the password fields in the environment. 

Warning

Do not run `make init-reset-env` after the environment has been initialized. Things will no longer work properly.

```
`make init-reset-env
`
```

Will output the following.

```
`make env-transplant
Wrote updated config to [.env]
make env-scramble-secrets
Scrambling [MARIADB_PASSWORD]
Scrambling [MARIADB_ROOT_PASSWORD]
Scrambling [SERVER_PASSWORD]
Scrambling [PHPMYADMIN_PASSWORD]
Scrambling [SPIRE_ADMIN_PASSWORD]
Scrambling [PEQ_EDITOR_PROXY_PASSWORD]
Scrambling [PEQ_EDITOR_PASSWORD]
Scrambling [FTP_QUESTS_PASSWORD]
Wrote updated config to [.env]
`
```

### Initialize Network Parameters¶

The next command is going to initialize two large key things in our setup 

- The **ip address** we're going to use

- The **zone port range** we're going to use

Make sure that you only open as many ports as you need on the zone end, because `docker-proxy` will NAT all ports individually in its own docker userland which does take some time when starting and shutting off containers. 

The more ports you nail up, the longer it takes to start / stop. Since this is a test server, I'm only going to use 30 ports. 

This `make` command also configures the `eqemu_config.json` port and address parameters as well automatically for you

```
`make set-vars port-range-high=7030 ip-address=66.70.153.122
`
```

Yields the following output

```
`Wrote [IP_ADDRESS] = [66.70.153.122] to [.env]
Wrote [PORT_RANGE_HIGH] = [7030] to [.env]
`
```

## Install¶

From this point you're ready to run the fully automated install with a simple `make install`

An example of what this output looks like below (Sped up)

## Post-Install¶

### Start / Stop¶

To start the server, simply use the **make up** command from the root of the **akk-stack** directory

```
`make up
`
```

To stop the server, simply use the **make down** command from the root of the **akk-stack** directory

```
`make down
`
```

### Deployment Info¶

To print a handy list of passwords and access URL's, simply use **make info** at the host level of the deployment. Spire is located at the EQEmu Admin web interface.

```
`make info
`
```

Info

Note this may look different depending on the services you have booted

```
`----------------------------------
> Server Info
----------------------------------
> Akkas Test Bed (LDL)
----------------------------------
> Passwords
----------------------------------
MARIADB_PASSWORD=wNh6CrKiVq6oy5FPjQIMr7M18oAC7Ii
MARIADB_ROOT_PASSWORD=jrwe7Jv6sZRgrYig5vgoTEvBX6XGgxb
SERVER_PASSWORD=UXWrUXWv4MPZsJpUgbWuEPJn59ksNpc
PHPMYADMIN_PASSWORD=L6buMu5dzfIkhNTjh7LeMsxNdFfLUrA
PEQ_EDITOR_PASSWORD=jufMcw584ZDK3JRNJf4JB8z0e3Whoma
FTP_QUESTS_PASSWORD=gtL1yKDmZyC4eK9X85ZAytGdUVEgN62
----------------------------------
> IP
----------------------------------
IP_ADDRESS=192.168.65.62
----------------------------------
> Quests FTP | 192.168.65.62:21 | quests / gtL1yKDmZyC4eK9X85ZAytGdUVEgN62
----------------------------------
> Web Interfaces
----------------------------------
> PEQ Editor | http://192.168.65.62:8081 | admin / jufMcw584ZDK3JRNJf4JB8z0e3Whoma
> PhpMyAdmin | http://192.168.65.62:8082 | admin / L6buMu5dzfIkhNTjh7LeMsxNdFfLUrA
> EQEmu Admin | http://192.168.65.62:3000 | admin / 2c9a88fa8470a70168080e5dbc8446
----------------------------------
> Spire Backend Development | http://192.168.65.62:3010 | 
> Spire Frontend Development | http://192.168.65.62:8080 | 
----------------------------------
`
```

### Deploying Bots¶

To enable Bots, navigate into your **akk-stack** directory and run the following commands:

```
`user@host:~/akk-stack$ make bash
eqemu@ct-eqemu-server:~/$ cd server
eqemu@ct-eqemu-server:~/server$ bin/world bots:enable
`
```

The output will look like this:

```
` World | Info | BotsEnable Bootstrapping bot tables
 World | Info | SourceSqlFromUrl Downloading and installing from [https://raw.githubusercontent.com/EQEmu/Server/master/utils/sql/bot_tables_bootstrap.sql]
 World | Info | BotsEnable Enabling bots
 World | Info | BotsEnable Setting rule Bots:Enabled to true
`
```

Doing this will create the required tables. At the next server boot, you will have access to the bot commands. If you need disable bots, you will run the disable command:

```
`eqemu@ct-eqemu-server:~/server$ bin/world bots:disable
`
```

The output will look like this:

```
`Warning! This will drop all bot tables, are you sure? [y/n]y
 World | Info | BotsDisable Dropping table [bot_blocked_buffs]
 World | Info | BotsDisable Dropping table [bot_buffs]
 World | Info | BotsDisable Dropping table [bot_command_settings]
 World | Info | BotsDisable Dropping table [bot_create_combinations]
 World | Info | BotsDisable Dropping table [bot_data]
 World | Info | BotsDisable Dropping table [bot_heal_rotation_members]
 World | Info | BotsDisable Dropping table [bot_heal_rotation_targets]
 World | Info | BotsDisable Dropping table [bot_heal_rotations]
 World | Info | BotsDisable Dropping table [bot_inspect_messages]
 World | Info | BotsDisable Dropping table [bot_inventories]
 World | Info | BotsDisable Dropping table [bot_owner_options]
 World | Info | BotsDisable Dropping table [bot_pet_buffs]
 World | Info | BotsDisable Dropping table [bot_pet_inventories]
 World | Info | BotsDisable Dropping table [bot_pets]
 World | Info | BotsDisable Dropping table [bot_settings]
 World | Info | BotsDisable Dropping table [bot_spell_casting_chances]
 World | Info | BotsDisable Dropping table [bot_spell_settings]
 World | Info | BotsDisable Dropping table [bot_spells_entries]
 World | Info | BotsDisable Dropping table [bot_stances]
 World | Info | BotsDisable Dropping table [bot_timers]
 World | Info | BotsDisable Setting rule Bots:Enabled to false
 World | Info | BotsDisable Bots disabled
`
```

Answering `yes` removes the tables from the database and disables bots.

### Deploying Mercenaries¶

To enable Mercs, navigate into your **akk-stack** directory and run the following commands:

```
`user@host:~/akk-stack$ make bash
eqemu@ct-eqemu-server:~/$ cd server
eqemu@ct-eqemu-server:~/server$ bin/world mercs:enable
`
```

The output will look like this:

```
` World | Info | MercsEnable Bootstrapping merc tables
 World | Info | SourceSqlFromUrl Downloading and installing from [https://raw.githubusercontent.com/EQEmu/Server/master/utils/sql/merc_tables_bootstrap.sql]
 World | Info | MercsEnable Enabling Mercenaries
 World | Info | MercsEnable Setting rule Mercs:AllowMercs to true
 World | Info | MercsEnable Mercenaries enabled
`
```

Doing this will create the required tables. At the next server boot, you will have access to the mercenary merchants. If you need disable mercs, you will run the disable command:

```
`eqemu@ct-eqemu-server:~/server$ bin/world mercs:disable
`
```

The output will look like this:

```
`Warning! This will drop all merc tables, are you sure? [y/n]y
 World | Info | MercsDisable Dropping table [merc_armorinfo]
 World | Info | MercsDisable Dropping table [merc_inventory]
 World | Info | MercsDisable Dropping table [merc_merchant_entries]
 World | Info | MercsDisable Dropping table [merc_merchant_template_entries]
 World | Info | MercsDisable Dropping table [merc_merchant_templates]
 World | Info | MercsDisable Dropping table [merc_name_types]
 World | Info | MercsDisable Dropping table [merc_npc_types]
 World | Info | MercsDisable Dropping table [merc_spell_list_entries]
 World | Info | MercsDisable Dropping table [merc_spell_lists]
 World | Info | MercsDisable Dropping table [merc_stance_entries]
 World | Info | MercsDisable Dropping table [merc_stats]
 World | Info | MercsDisable Dropping table [merc_subtypes]
 World | Info | MercsDisable Dropping table [merc_templates]
 World | Info | MercsDisable Dropping table [merc_types]
 World | Info | MercsDisable Dropping table [merc_weaponinfo]
 World | Info | MercsDisable Setting rule Mercs:AllowMercs to false
 World | Info | MercsDisable Disabled mercs and dropped tables
`
```

Answering `yes` removes the tables from the database and disables mercs.

### Local Loginserver¶

(Optional) Spire web interface can be used to enable and start a local loginserver process. Depending on your setup (i.e., server on LAN) you may need to modify `localaddress` to match `address` within `akk-stack/server/eqemu_config.json` and `make down`/`make up`.

---

## Introduction

*Source: akk-stack/introduction/index.html*

# Introduction¶

---

**AkkStack** is a simple **Docker Compose** environment that is augmented with **developer** and **operator** focused
tooling for running **EverQuest Emulator servers**.

You can have an entire server running within **minutes**, configured and ready to go for **development** or **production
** use!

This is what I've used in production, battle-tested, for almost 5+ years. I've worked through a lot of issues to give you the final stable product.

It's what I've also used exclusively for development as well as many other developers!

**Repository** https://github.com/Akkadius/akk-stack

---

## Features¶

- **Perl 5.24.4 x64** (Quests)

- **Lua Server Runtime** (Quests)

- **MariaDB x64 10.x**

- **Latest PEQ Database**

- **Latest PEQ Quests**

- **V2 Server Side Maps**

- **Optimized and latest server binaries (Stable)**

- **Spire Web Admin / Content Editor**

- **ProjectEQ Editor**

- **SSH in the eqemu-server container on port 2222**

- **make menu for managing the eqemu-server container**

- **make menu for managing the host-level container environment**

- **Cron Jobs for the eqemu-server container**

- **Startup Scripts for the eqemu-server container**

- **Docker Compose v2 for easy management**

- **Developer and Operator focused tooling**

- **Developer tuned environment for easy development**

- **Operator tuned environment for easy management**

### Containerized Services¶

| 

**Service** 
| **Description** 

| **eqemu-server** 
| Runs the emulator server and all services related to the emulator server 

| **mariadb** 
| MySQL service 

| **phpmyadmin** 
| (Optional) PhpMyAdmin which is automatically configured behind a password proxy 

| **peq-editor** 
| (Optional) PEQ Editor which is automatically configured 

| **ftp-quests** 
| (Optional) An FTP instance fully ready to be used to remotely edit quests 

| **backup-cron** 
| (Optional) A container built to automatically backup (Dropbox API) the entire deployment and perform database and quest snapshots for with different retention schedules defined in **.env** 

### Spire Web Admin¶

Spire is a powerhouse web admin panel as well as rich server content editor. It is
continually being developed and new features being added regularly.

### PEQ Editor¶

Automatically configured with pre-set admin password, listens on port **8081** by default

### PhpMyAdmin¶

Automatically configured **PhpMyAdmin** instance with pre-set admin password (Behind a password protected proxy) listens
on port 8082 by default

### CLI Menus¶

#### Embedded Server Management CLI¶

Embedded server management CLI makes for quick and easy management of the server

#### In Container Command Menu¶

A **make** menu to manage the in-container environment, need to be in home directory **cd ~/** to use

#### Host-Level Command Menu¶

A **make** menu to manage the host-level container environment

### SSH¶

**eqemu-server** starts with SSH server, the installation provides a generated 30+ character password, persistent keys
through reboot.

Info

Default port is **2222**

### Cron Jobs¶

Cronjob support via crontab is available in the **eqemu-server** container.

Edit **~/assets/cron/crontab.cron** directly and the file watcher will install new crontab changes. (You cannot use
crontab -e)

For example, PEQ has a configured database dump cron that feeds https://db.projecteq.net

```
`eqemu@f30bb0b5bd3c:~$ cat ~/assets/cron/crontab.cron 
0 3 * * * cd /home/eqemu/server && ./scripts/peq-dump.sh && curl -F 'data=@/tmp/peq-latest.zip' http://db.projecteq.net/api/v1/dump/upload\?key\=apikey && rm /tmp/peq-latest.zip
`
```

### Startup Scripts¶

The **eqemu-server** container will start applications or scripts in **~/server/startup/*** folder.

Warning

Do not try to run eqemu services here as they are managed by Spire

This is useful for running custom scripts or applications on startup, for example, a Discord bot

```
`eqemu@f30bb0b5bd3c:~$ ls -lsh ~/server/startup
total 8.7M
8.7M -rwxr-xr-x 1 eqemu eqemu 8.7M Jun 10 2019 discordeq
`
```

### Automated Backups¶

There is a **backup-cron** container that is optional to use, it will automatically backup the entire deployment and
perform database and quest snapshots for with different retention schedules defined in **.env**

---

## Backups

*Source: akk-stack/operate/backups/index.html*

# Backups

Info

Automated cron-based backups that upload to **Dropbox** using **Dropbox API**

There are plans to update this to include more cloud providers in the future via https://rclone.org/ but Dropbox has been tried and true for many years and is a great solution currently.

### Initialize Backups¶

To get started, you need to run the uploader script in the backup-cron container for the first time to initialize your application

As of July 2021 this guide has changed to Dropbox's new auth mechanisms to include more configuration in the OAuth flow.

```
`docker-compose exec backup-cron dropbox_uploader.sh
`
```

Follow the instructions prompted from running the command

```
` This is the first time you run this script, please follow the instructions:

(note: Dropbox will change their API on 2021-09-30.
When using dropbox_uploader.sh configured in the past with the old API, have a look at README.md, before continue.)

 1) Open the following URL in your Browser, and log in using your account: https://www.dropbox.com/developers/apps
 2) Click on "Create App", then select "Choose an API: Scoped Access"
 3) "Choose the type of access you need: App folder"
 4) Enter the "App Name" that you prefer (e.g. MyUploader1167208717053), must be unique

 Now, click on the "Create App" button.

 5) Now the new configuration is opened, switch to tab "permissions" and check "files.metadata.read/write" and "files.content.read/write"
 Now, click on the "Submit" button.

 6) Now to tab "settings" and provide the following information:
 App key: dmz4wbjsnghfkwj
 App secret: iq26gmwnlsnwj48
 Open the following URL in your Browser and allow suggested permissions: https://www.dropbox.com/oauth2/authorize?client_id=dmz4wbjsnghfkwj&token_access_type=offline&response_type=code
 Please provide the access code: Bun8T-9NG2kAAAAAAABF0by79e-VuivtOXRtHkS10KA 

 > App key: xxx
 > App secret: 'xxx
 > Access code: 'Bun8T-9NG2kAAAAAAABF0by79e-xxx'. Looks ok? [y/N]: y
 The configuration has been saved.
`
```

Once you go through the steps of creating your application. Do not forget to set scopes on your app to be able to write and read files. You MUST follow the prompts above in order otherwise you will run into issues.

Your configuration gets written to `.dropbox_uploader` which resides at the root of your deployment. This is a sensitive file and is not to be checked into any sort of version control and is used by the `backup-cron` container

### Validate it Works!¶

Run `make backup-dropbox-list`

```
`make backup-dropbox-list
docker-compose up -d backup-cron
docker-compose exec backup-cron dropbox_uploader.sh list
 > Listing "/"... DONE
`
```

If it shows `> Listing "/"... DONE` then it is initialized successfully

You can test by running a backup

```
`make backup-dropbox-database
docker-compose exec backup-cron ./backup/backup-database.sh
# Dumping database and compressing
peq-06-19-2022.sql
# Uploading database snapshot
 > Uploading "/tmp/peq-06-19-2022.tar.gz" to "/backups/database-snapshots/peq-06-19-2022.tar.gz"... DONE
# Truncating backups/database-snapshots days back 7
# Cleaning up...
`
```

### Backup Configuration¶

Backup retention configurable in `.env`

Your deployment name is what your backups will be prepended to when they get uploaded to Dropbox

```
`# DEPLOYMENT_NAME=peq-production
# BACKUP_RETENTION_DAYS_DB_SNAPSHOTS=10
# BACKUP_RETENTION_DAYS_DEPLOYMENT=35
# BACKUP_RETENTION_DAYS_QUEST_SNAPSHOTS=7
`
```

Crons defined in `backup/crontab.cron`

Crons are configured to run on a variance so that not all deployments fire backups at the same time

| 

**Backup Type** 
| **Description** 
| **Schedule** 

| Deployment 
| Deployment consists of the entire akk-stack folder (server, database etc.). If you ever experienced catastrophic failure or needed to restore the entire setup, simply restoring the deployment folder will get you back up and running 
| Once a week at 1AM on a random variance of 1800 seconds 

| Quests 
| A simple snapshot of the quests folder 
| Once a day at 1M on a random variance of 1800 seconds 

| Database 
| A simple snapshot of the database 
| Once a day at 1M on a random variance of 1800 seconds 

### Running Backups Manually¶

Bash into the `backup-cron` service; assuming your OAUTH token is valid and everything works

```
`root@host:/opt/eqemu-servers/peq-production# docker-compose exec backup-cron bash
`
```

```
`backup-cron@backup-cron:~$ dropbox_uploader.sh list peq-production
 > Listing "/peq-production"... DONE
 [D] database-snapshots
 [D] deployment-backups
 [D] quest-snapshots
`
```

**Database Snapshots**

```
`backup-cron@backup-cron:~$ dropbox_uploader.sh list peq-production/database-snapshots
 > Listing "/peq-production/database-snapshots"... DONE
 [F] 182189205 peq-07-02-2020.tar.gz
 [F] 182222834 peq-07-03-2020.tar.gz
 [F] 182263995 peq-07-04-2020.tar.gz
 [F] 182300144 peq-07-05-2020.tar.gz
 [F] 182394017 peq-07-06-2020.tar.gz
 [F] 182464528 peq-07-07-2020.tar.gz
 [F] 182465093 peq-07-08-2020.tar.gz
 [F] 182527952 peq-07-09-2020.tar.gz
 [F] 182574977 peq-07-10-2020.tar.gz
 [F] 182566469 peq-07-11-2020.tar.gz
 [F] 182661537 peq-07-12-2020.tar.gz
 ...
`
```

**Deployment Snapshots**

(Includes entire deployment folder)

```
` backup-cron@backup-cron:~$ dropbox_uploader.sh list peq-production/deployment-backups
 > Listing "/peq-production/deployment-backups"... DONE
 [F] 3309179293 deployment-07-02-2020.tar.gz
 [F] 2357754207 deployment-07-05-2020.tar.gz
 [F] 2364156848 deployment-07-12-2020.tar.gz
 ...
`
```

***Quest Snapshots***

```
`backup-cron@backup-cron:~$ dropbox_uploader.sh list peq-production/quest-snapshots
 > Listing "/peq-production/quest-snapshots"... DONE
 [F] 29464443 quests-07-07-2020.tar.gz
 [F] 29464443 quests-07-08-2020.tar.gz
 [F] 29464443 quests-07-09-2020.tar.gz
 [F] 29464443 quests-07-10-2020.tar.gz
 [F] 29464443 quests-07-11-2020.tar.gz
 [F] 29464443 quests-07-12-2020.tar.gz
 ...
`
```

---

## CPU

*Source: akk-stack/operate/cpu/index.html*

# CPU¶

Akk Stack employs a few different methods to protect the CPU from being over-utilized and to ensure that the server is always responsive.

## CPU Limiting¶

The **eqemu-server** container is limited to 90% of the CPU by default. This is to ensure that the server is always responsive and that the host is not over-utilized. This can be changed in the **docker-compose.yml** file.

```
`cat docker-compose.yml | grep shares
 cpu_shares: 900
`
```

https://docs.docker.com/config/containers/resource_constraints/#configure-the-default-cfs-scheduler

## CPU Watchdog¶

The **eqemu-server** container has a watchdog that will kill processes that are running high for too long. This is to protect from common occurrences where a server operator accidently creates a loop in a script causing the zone process CPU to spike to 100% and become entirely unresponsive. The watchdog is designed to detect and kill these processes.

You can check the logs if you suspect a process is triggering the watchdog from the root of the **eqemu-server** home directory.

```
`cat process-kill.log
`
```

```
`Sat Jul 11 20:52:47 CDT 2020 [process-watcher] Killed process [21143] [./bin/zone] for taking too much CPU time [43.50]
`
```

---

## Development

*Source: akk-stack/operate/development/index.html*

# Development¶

Info

This page will go detail tools and processes around using akk-stack for server development, spire development, etc.

## EQEmu Server Development¶

When **akk-stack** is installed, it by default uses pre-compiled binaries for those who have no interest in making modifications to the server. This uses stock binaries that are available via the release pipeline here and can be browsed in Spire's release analytics

### Compiling¶

Info

**Compiling for server development** within **akk-stack** has some extra features that are available to you out of the box that will save developers a tremendous amount of time.

If you are interested in compiling your own binaries, you can do so by following the instructions detailed below.

#### Initialize Development Build¶

Initialize your development build by using `make init-dev-build` when shelled into the home directory of the server container.

```
`cd ~/ && make init-dev-build
`
```

**What this does**

- Initialize the build environment for you and set up the necessary tools to compile the server. This includes setting up the necessary dependencies, and setting up the necessary environment variables to compile the server.

- It uses a specific version of **Perl** that is known to work with the server, the **eqemu-server** container image is already pre-baked with all of the sane defaults for this to work flawlessly out of the box. It is decoupled from system Perl and is not affected by system Perl updates.

- It **disables compilation optimizations** and enables debugging symbols to be able to debug the server effectively and speeds up compilation tremendously because we're not doing optimization passes in the compiler.

- Ccache is also used to speed up compilation times, and the build is done using the **Ninja** build system. This is also pre-baked into the **eqemu-server** container image and you don't have to do any configuration beyond running the make command.

- Uses the **gold** linker which is known to be faster than the default linker that comes with the compiler.

- Uses the **Clang** compiler which is known to be faster than the default GCC compiler that comes with the compiler.

- Uses **Ninja** as the build system which is known to be faster than the default **make** build system that comes with the compiler.

```
`> Initializing EQEmu Server Build

cd ~/code && \
 git submodule init && \
 git submodule update && \
 rm -rf build && \
 mkdir -p build && \
 cd build && \
 cmake -DEQEMU_BUILD_LOGIN=ON \
 -DEQEMU_BUILD_TESTS=ON \
 -DCMAKE_CXX_COMPILER_LAUNCHER=ccache \
 -DPERL_LIBRARY=/opt/eqemu-perl/lib/5.32.1/x86_64-linux-thread-multi/CORE/libperl.so \
 -DPERL_EXECUTABLE=/opt/eqemu-perl/bin/perl \
 -DPERL_INCLUDE_PATH=/opt/eqemu-perl/lib/5.32.1/x86_64-linux-thread-multi/CORE/ \
 -DCMAKE_EXE_LINKER_FLAGS=-fuse-ld=gold \
 -DCMAKE_CXX_FLAGS_RELWITHDEBINFO:STRING="-O0 -g -DNDEBUG -Os -Wno-everything" -G "Ninja" ..
-- The C compiler identification is Clang 14.0.6
-- The CXX compiler identification is Clang 14.0.6
-- Detecting C compiler ABI info
-- Detecting C compiler ABI info - done
... truncated output
`
```

#### Running the Build¶

**akk-stack** comes configured with a very simple alias that can be used anywhere in the shell to invoke the build, simply by typing `n`

```
`n
`
```

Under the hood, this is just a simple alias that changes to the build directory and runs the build using the `ninja` build system.

```
`alias n='cd ~/code/build && ninja -j$(expr $(nproc) - 2)'
`
```

You will see an output that resembles the following:

```
`eqemu@66636230306d:~/code/build$ n
[90/130] Building CXX object zone/CMakeFiles/zone.dir/zone_base_data.cpp.o
`
```

## Spire Development¶

Spire is a web-based content editor and server management tool that is used to manage the server. **akk-stack** is setup the best to be able to develop and test Spire in a local environment.

In the **.env** file, set `SPIRE_DEV=true` and make sure `ENV=development` is set. 

On your Docker host run the following commands:

```
`make down
docker-compose pull
docker-compose build
make up
`
```

If you are running the initial installation of **akk-stack** this will be ran during install, but if you already have **akk-stack** installed, you can run `make init-spire-dev` in the **eqemu-server** container to initialize the development environment for Spire.

Shell into the **eqemu-server** container via 

```
`make bash
`
```

And then run

```
`make init-spire-dev
`
```

### Spire Development Aliases¶

**akk-stack** comes with a few aliases that are useful for developing Spire. 

- **spire** Changes to the Spire directory

- **spire-be** Starts the Spire backend in development mode restarting on file changes

- **spire-fe** Starts the Spire frontend in development mode restarting on file changes

```
`alias spire='cd ~/server/spire'
alias spire-be='cd ~/server/spire && air'
alias spire-fe='cd ~/server/spire/frontend && npm run dev'
`
```

---

## File Structure

*Source: akk-stack/operate/file-structure/index.html*

# File Structure

Info

This page shows the structure of the **akk-stack** file system and how to interact with it.

## Standard Server Directories¶

Within the **eqemu-server** container, the fileystem is ephermeral, meaning it will not persist through a reboot. The
following directories noted that are shared to the host and will persist through a reboot.

| 

Directory 
| Details 

| **/opt/eqemu-perl/** 
| Where our eqemu-specific version of Perl is installed to. You usually don't need to do anything here. 

| **~/.ssh/** 
| **(Shared to the host @./assets/ssh/)** Where SSH client keys are persisted if you use them to clone custom Git repo's using SSH etc. Also used to store keys of users who access **eqemu-server** 

| **~/assets** 
| **(Shared to the host @./assets)** This is for common server utilities, management scripts, crontab, these are usually a part of akk-stack exclusively 

| **~/code** 
| **(Shared to the host @./code)** Where EQEmu Server source code is located if you wish to compile yourself (not required) 

| **~/code/build** 
| Where the **CMake** configuration is held for **make** or **ninja** **- Navigate via "build" command** 

| **~/code/build/bin** 
| If you compile, where executables are built to and symlinked to **~/server/bin** 

| **~/server** 
| **(Shared to the host @./server)** Where the main server folder is located. **- Navigate via "server" command** 

| **~/server/backups** 
| Where server automatic database backups go when there are server schema updates. These can be used to revert prior to an update if needed. Rare necessity but here if needed. 

| **~/server/maps** 
| Where server side maps are located **- Navigate via "maps" command** 

| **~/server/quests** 
| Where server side quests are located **- Navigate via "quests" command** 

| **~/server/shared** 
| Where server side shared memory mapped files are located 

| **~/server/logs** 
| Where server logs are located 

| **~/server/plugins** 
| Where server quest perl plugins are located **- Navigate via "plugins" command** 

| **~/server/lua_modules** 
| Where server quest lua plugins are located **- Navigate via "bin" command** 

| **~/server/assets** 
| Where server client patches, opcodes, misc are located **- Navigate via "assets" command** 

| **~/server/bin** 
| Where server executables are located **- Navigate via "bin" command** 

| **~/server/startup** 
| Where server startup scripts are located, for running custom services not managed by Spire on container bootup 

## Symlinked Directories¶

- Server binaries - Never need to copy binaries after a compile

- Patch files

- Quests

- Plugins

- LUA Modules

Symlinks are created on bootup of the container and are not ones you need to manage yourself and are here for
convenience.

This means that when the **~/code** directory is updated via **git pull** the opcodes and patch files are automatically
updated.

When you compile new binaries, the symlinks are automatically updated to the new binaries in the **~/server/bin**
directory.

```
`~/assets/scripts/create-symlinks.pl 
 Symlinking Source: /home/eqemu/code/build/bin/export_client_files Target: /home/eqemu/server/bin/export_client_files
 Symlinking Source: /home/eqemu/code/build/bin/import_client_files Target: /home/eqemu/server/bin/import_client_files
 Symlinking Source: /home/eqemu/code/build/bin/loginserver Target: /home/eqemu/server/bin/loginserver
 Symlinking Source: /home/eqemu/code/build/bin/queryserv Target: /home/eqemu/server/bin/queryserv
 Symlinking Source: /home/eqemu/code/build/bin/shared_memory Target: /home/eqemu/server/bin/shared_memory
 Symlinking Source: /home/eqemu/code/build/bin/ucs Target: /home/eqemu/server/bin/ucs
 Symlinking Source: /home/eqemu/code/build/bin/world Target: /home/eqemu/server/bin/world
 Symlinking Source: /home/eqemu/code/build/bin/zone Target: /home/eqemu/server/bin/zone
# Symlinking patches
 Symlinking Source: /home/eqemu/code/utils/patches/patch_RoF.conf Target: /home/eqemu/server/assets/patches/patch_RoF.conf
 Symlinking Source: /home/eqemu/code/utils/patches/patch_SoD.conf Target: /home/eqemu/server/assets/patches/patch_SoD.conf
 Symlinking Source: /home/eqemu/code/utils/patches/patch_UF.conf Target: /home/eqemu/server/assets/patches/patch_UF.conf
 Symlinking Source: /home/eqemu/code/utils/patches/patch_RoF2.conf Target: /home/eqemu/server/assets/patches/patch_RoF2.conf
 Symlinking Source: /home/eqemu/code/utils/patches/patch_Titanium.conf Target: /home/eqemu/server/assets/patches/patch_Titanium.conf
 Symlinking Source: /home/eqemu/code/utils/patches/patch_SoF.conf Target: /home/eqemu/server/assets/patches/patch_SoF.conf
# Symlinking opcodes
 Symlinking Source: /home/eqemu/code/utils/patches/opcodes.conf Target: /home/eqemu/server/assets/opcodes/opcodes.conf
 Symlinking Source: /home/eqemu/code/utils/patches/mail_opcodes.conf Target: /home/eqemu/server/assets/opcodes/mail_opcodes.conf
# Symlinking plugins
 Symlinking Source: /home/eqemu/server/quests/plugins/ Target: /home/eqemu/server
# Symlinking lua_modules
 Symlinking Source: /home/eqemu/server/quests/lua_modules/ Target: /home/eqemu/server
`
```

---

## Services

*Source: akk-stack/operate/services/index.html*

# Services¶

See the following table for a list of services that are available in the **akk-stack**

Optional services are enabled through the **.env** file

| 

**Service** 
| **Description** 

| **eqemu-server** 
| Runs the emulator server and all services related to the emulator server 

| **mariadb** 
| MySQL service 

| **phpmyadmin** 
| **(Optional)** PhpMyAdmin which is automatically configured behind a password proxy 

| **peq-editor** 
| **(Optional)** PEQ Editor which is automatically configured 

| **ftp-quests** 
| **(Optional)** An FTP instance fully ready to be used to remotely edit quests 

| **backup-cron** 
| **(Optional)** A container built to automatically backup (Dropbox API) the entire deployment and perform database and quest snapshots for with different retention schedules defined in **.env** 

## Enabling Services¶

In your **.env** file you can enable or disable services by setting the **ENABLE_** variable to **true** or **false** and will be started when you run **make up**

```
`###########################################################
# Services
###########################################################
ENABLE_BACKUP_CRON=false
ENABLE_FTP_QUESTS=false
ENABLE_PEQ_EDITOR=false
ENABLE_PHPMYADMIN=false
`
```

## Service Lifetime¶

By default each container / service in the **docker-compose.yml** is configured to restart unless stopped, meaning if the server restarts the Docker daemon will boot the services you had started initially which is the default behavior of this stack

**Spire** and the **eqemu-server** entrypoint bootup script is designed to start the emulator server services when the server first comes up, so if you need to bring the whole host down, everything will **come back up on reboot automatically**

---

## Shell

*Source: akk-stack/operate/shell/index.html*

# Shell

Info

Now that you're installed we need to look at how we interact with the environment.

There are many ways to shell into services in the stack, this is a quick overview of the most common methods

### Direct Bash¶

From the host level, you can use **make bash** to hop into the **eqemu-server** container

### SSH¶

You can use the default SSH port **2222** to shell into the **eqemu-server** container remotely. This password is generated at install time and is persistent through reboots and can be found in the **.env** file

### MySQL Console¶

You can obtain a MySQL shell from either **eqemu-server** **make mc** or from the **eqemu-server** embedded shell alias **mc**

---

## Update

*Source: akk-stack/operate/update/index.html*

# Update

### Updating Akk Stack¶

Most of the time, unless instructed otherwise, updating the **akk-stack** is as simple as running the following command from the root of the **akk-stack** directory

```
`make down
git pull
docker-compose pull
docker-compose build
make up
`
```

This does not touch the database, the server directory, or any of the configuration files. It's a safe way to update the stack without losing any data.

Keep in mind of new environment variables that may be added to the **.env** file via **.env.example**

### Updating Spire¶

From within the **eqemu-server** container at the root of the home directory, you can run the following command to update the Spire server binaries. Do note that Spire can also be updated from within the Spire admin panel.

```
`make update-admin-panel
`
```

It will kill the currently running panel, cycle it out, start it up. This is not service affecting for running servers with a launcher running.

### Updating Server Binaries¶

Updating server binaries is as simple as running **update** in the **eqemu-server** shell, it will change directory to the source directory, git pull and run a build which will be immediately available the next time you boot a process

You can update using server release binaries by running

```
`update
`
```

You can update by compiling the source yourself by running

```
`update-source
`
```

You can also update binaries within the Spire Admin panel.

---

## Email Protection | Cloudflare

*Source: cdn-cgi/l/email-protection.html*

Email Protection | Cloudflare

- 

 Please enable cookies.

# Email Protection

## You are unable to access this email address eqemu.dev

The website from which you got to this page is protected by Cloudflare. Email addresses on that page have been hidden in order to keep them from being accessed by malicious bots. **You must enable Javascript in your browser in order to decode the e-mail address**.

If you have a website and are interested in protecting it in a similar way, you can sign up for Cloudflare.

 How does Cloudflare protect email addresses on website from spammers?

 - Can I sign up for Cloudflare?

 Cloudflare Ray ID: **9ae74678c8f902c8**
 &bull;
 
 Your IP:
 Click to reveal
 73.50.4.59
 &bull;
 
 Performance & security by Cloudflare

---

## How to Doc

*Source: contributing/how-to-doc/index.html*

# How to Doc

Looking to add to the documentation? Not sure how? You've found the right place

In this page we'll go over how to add new pages, formatting, tips and tricks, guidelines etc.

## Markdown¶

First of all, if you're not familiar with markdown - every single page in the docs are written in markdown. Check out the markdown getting started page and get familiar with it.

## MkDocs Material¶

While there is standard markdown syntax, we have a variety of **markdown extensions** that we use from our documentation platform MkDocs Material of which you can reference for different ways to format different elements

## Making Small Page Edits¶

You will see on most pages in the upper right corner of the page there is an **Edit This Page** which will bring you straight to Github

When you click edit, it will bring you to Github

You can click the **Preview** tab to help you see what your markdown looks like

Notice `!!! info` is not formatted in the Github preview, that is because it is custom MkDocs markdown formatting. Using this method works for light editing but if you plan on writing documentation regularly you should install MkDocs

You can submit a pull request or a commit to this repository and changes when approved and merged will automatically be published to this site.

## Install MkDocs Material¶

Clone our documentation repository 

```
`git clone https://github.com/EQEmu/eqemu-docs-v2.git
cd eqemu-docs-v2
`
```

Install mkdocs

Requires having Python installed

```
`pip install mkdocs-material
`
```

## Run the Documentation Server¶

Once it is successfully installed you can run the development docs server

```
`mkdocs serve --dirtyreload

INFO - Documentation built in 15.81 seconds
INFO - [01:26:45] Serving on http://127.0.0.1:8000/
INFO - [01:26:46] Browser connected: http://127.0.0.1:8000/contributing/how-to-doc/
INFO - [01:27:13] Detected file changes
`
```

We use the `--dirtyreload` for speed reasons and it's very important. Every time we make a change to a simple page we don't want to rebuild the whole entire thing. We have well over 600 pages of documentation and this would take too long.

The only time you need to re-run this command is when you make navigation changes to `mkdocs.yml`. Small changes to markdown files don't require re-running `mkdocs serve`

## Editing Pages¶

Now that you have the MkDocs Material Documentation Server running, it's a good idea to use some sort of text editor locally to edit the files. 

You can use a simple text editor to edit markdown files. If you want a visual aid for what your markdown looks like you can install a markdown extension in your editor of choice like Visual Studio Code, Sublime, Jetbrains IDE's etc.

## Uploading Images¶

Very often you will want to use images to illustrate points in your docs. How do you upload an image? Where do you put it? Well, there are a few options.

You can upload images via commit git but its not recommended to be storing images at scale in the repository. You also want to make sure that if you are using an image that it is uploaded to a reliable image host so we don't have dead image links in the future.

The most reliable mechanism for uploading images is to use a hack that I use which is to use the Github issues page to copy and paste images into the text area and it will return a markdown code for you to use in your page.

## Adding a New Page to the Navigation Tree¶

The documentation navigation tree configuration is stored in `mkdocs.yml` at the top of the documentation repository in the `nav` section.

https://github.com/EQEmu/eqemu-docs-v2/blob/main/mkdocs.yml

Do not nest pages more than 1-2 levels deep. We should not have to gopher dig for information and should be easily accessible within a simple 1-2 categorization method.

For example if your new page has something to do with inventory logic, then it should be under a top level category called **Inventory** not something archaic like **Developer Notes** -> **Developer Section** -> **Inventory Notes** -> **Inventory Logic**

---

## Welcome

*Source: index.html*

# Welcome¶

Welcome to the **EverQuest Emulator Server** community docs!

Everything you need can be found by using **search** as well as the left and top nav menus!

Info

If you see anything that is missing or could be improved, please feel free to contribute and feel free to submit pull requests! Merged pull requests immediately publish to these docs.

The information presented represents the commitment of countless hours of coding and documentation by a large, passionate, open-source community.

The breadth of information compiled in the documentation is the accumulation of open source community members dating back to early 2000's.

The purpose of this platform is to allow a scalable transfer of knowledge and information regarding this massive project.

## EverQuest Emulator Server¶

**EverQuest Emulator Server is a custom, completely from-scratch reverse-engineered open source server implementation
for EverQuest built mostly on C / C++**

Features

- **Storage Engine** MySQL / MariaDB is used as the database engine (over 200+ tables)

- **Scripting Engine(s)** Perl and LUA are both supported scripting languages for NPC/Player/Quest oriented events

- **Game Content** Open source database (Project EQ) has content up to expansion OoW (included in server installs)

- Game server environments and databases can be heavily customized to create all new experiences

- Hundreds of Quests and events created and maintained by Project EQ

## Supported Clients¶

| 

Titanium Edition 
| Secrets of Faydwer 
| Seeds of Destruction 
| Underfoot 
| Rain of Fear (Most used) 

| 
| 
| 
| 
| 

## Server Installation¶

| 

Page 
| Platform 
| Description 
| Install Count 

| Server Installation (Windows) 
| Windows 
| A guide for installing EQEmu Server on Windows 
| 

| Server Installation (Linux) 
| Linux (Debian / Ubuntu) Preferred (Redhat / CentOS / Fedora supported) 
| A guide for installing EQEmu Server on Linux 
| 

| AkkStack (Docker) (Advanced) 
| Docker (Compose) 
| Containerized EverQuest Emulator Server Environment 
| 

| Dev container (Docker) (Advanced) 
| Docker 
| Development Environment in Vscode 
| - 

## Community¶

Find us on Discord!

## Bug Reports¶

- Please use the issue tracker provided by GitHub to send us bug reports or
 feature requests.

- Discord is also a place to get more immediate help from community members on
 troubleshooting

## External Resource links¶

| 

Page 
| Link 

| EQEmulator Website 
| http://www.eqemulator.org 

| EQEmu Server GitHub Repository 
| https://github.com/EQEmu/Server 

| Quest Scripts 
| https://github.com/ProjectEQ/projecteqquests 

| Plugins 
| https://github.com/ProjectEQ/projecteqquests/tree/master/plugins 

| Maps 
| https://github.com/EQEmuTools/eqemu-maps 

| Installer Resources 
| https://github.com/EQEmuTools/eqemu-install-v2 

| ProjectEQ (PEQ) Database 
| http://db.projecteq.net 

## Additional / Alternative Quest Script Repositories¶

| 

Description 
| Link 

| Project 2002 - Classic through POP quests in Lua 
| p2002 Quests

---

## Frequently Asked Questions

*Source: play/frequently-asked-questions/index.html*

# Frequently Asked Questions¶

## EQEmulator Support¶

**What is the Everquest Emulator?**

- EQEmu is a server program to allow Admins to run their own Private or Public servers.

**Can I play EQEmu without setting up a server?**

- Yes. If you only want to play the game, you don't have to run a server.

**Are there any costs to play the Everquest Emulator?**

- No, there are no costs to play.

**What is required to play on an Everquest Emulator Server?**

- The only requirement is a fresh install of Everquest Titanium (disks), Secrets of Faydwer (disks), Seeds of Destruction (Steam), Underfoot (Steam), or Rain of Fear (Steam) unpatched.

**Can I use the separate Expansion CDs if I have all of the Expansions included in Titanium?**

- No, only Everquest Titanium Pack (Discs) or Secrets of Faydwer (Discs) will work for the emulator. The rest of the compatible clients are all Digital Downloads from Steam. Nothing else will work.

**Is there any place I can download an Everquest Cient for EQEmulator?**

- No, not legally. You may only acquire Titanium and Secrets of Faydwer.

**Is the Emulator buggy?**

- There are some bugs in the emulator, but nothing major enough to keep people from having fun. New updates/fixes are added often.

**Is the Emulator Similar to EQLive?**

- There are many servers and each one is different, but some do simulate live closely up through DoN.

**Are there servers with special or custom setups?**

- Yes, there are many servers that have increased experience rates, custom loot, quest, zones, mobs, encounters, etc.

**How many servers are there for the emulator?**

- There are dozens of different public servers and also a few private servers as well.

**Is there a way to tell which servers are the most popular?**

- Yes, on the Login Server it lists all servers and each server shows the current population. You can judge popularity pretty well by what the population is. You can also view the Server List on the EQEmulator website for details.

**Where can I find more information about the Everquest Emulator?**

- You can find most of the information you need by reading through the Wiki. Another good place to find important information is in this list of useful resource Links:

- http://www.eqemulator.net/forums/showthread.php?t=26075

## Player Support¶

**I am running Windows Vista/7 and am having problems saving my eqhost.txt file after editing it as the Guide explained.**

- 

Due to the built-in UAC in Windows Vista & 7, you must either disable UAC or use the following work around to edit the eqhost.txt file:

- 

Click Start -> All Programs -> Accessories

- Right-click Notepad

- Choose "Run as Administrator"

- Click "Continue" at the UAC prompt

- Browse to and modify your eqhost.txt file as desired

**When I try to open EQ, the window blinks black and then closes and I get an error, but EQ never even starts.**

- Most likely you are having a resolution or drivers issue. Try adjusting your EQ or Desktop Resolutions or updating your video drivers. It may just be that EQ is trying to start in a resolution that it does not support. If setting your desktop to 1024X768 does not work, then you may need to set it in your eqclient.ini. There should be a file named OptionsEditor.exe in your Everquest folder. Open that program and set your resolution to 1024X768 and see if that helps. If not, run it again and try other resolutions. Once you have it working, you should be able to adjust your resolution from in game and then /camp out to save the new settings.

- Another possible resolution to this issue is sometimes to try another video card driver for your video card. You may want to try using an older driver or newer one to see if that makes a difference. You may need to run a driver cleaner application when installing your new (or old) video card drivers, depending on the instructions for changing drivers on your specific video card.

- If none of the above resolves your resolution, crash, or lockup problems, try the suggestions below:

- Right click on your Everquest icon and go under compatibility mode. There is a checkbox for "runs in 640x480 resolution". Click this. It does not mean the game will run in 640x480 but the intro screen will. Without that one checked, you may not even be able to get into the game.

- Now, change these under your video mode. If EQ starts in windowed mode, or if the character select is in windowed mode do this; center the windowed mode window up on your screen, to where it covers the entire screen. Now Hit ALT-ENTER and you will go full screen before you go into the game. Only then enter the world, not in windowed mode. The reason for this is if you go full screen it sometimes crashes and I would rather crash before my character enters the world.

- Make a copy of your eqclient.ini then delete what you have under the video mode section and change it to this:

```
`[VideoMode]
Width=1920
Height=1200
FullscreenBitsPerPixel=32
FullscreenRefreshRate=60
WindowedWidth=1920
WindowedHeight=1200
`
```

- When attempting to run more than one instance of Everquest it tries to open and then gives an error.

- You don't have enough memory to start another instance of EQ. Try adjusting your EQ settings lower. Turning off Luclin models helps the most.

**I am running Windows Vista and cannot get EQ to open or I get disconnected often.**

- Try running in Compatibility mode. See the link below to directions on how to do that:

- http://www.eqemulator.net/forums/showthread.php?t=25327

**EQ Opens and starts to patch, but my login doesn't work.**

- You messed up on the install setup. You need to uninstall EQ and delete the directory and follow this guide exactly:

- Play Guide: Getting Started

**I can get to the login screen, but I get an error saying that the connection timed out when I try to log in.**

- Either the login server is down, or more likely you need to adjust your eqhost.txt file as described in the play guide. Make certain that there are no extra spaces or carriage returns in the file. Also make sure you didn't accidentally save the file as eqhost.txt.txt or it won't work at all. Also, if you are trying to use EQEmu with an EQLive (Patched) installation instead of directly from the Titanium or Secrets of Faydwer Disks without patching, you will get a connection timed out error as well. In this case, though, it takes considerably longer before the error pops up after trying to log in. When the problem is with your network connection, the LS, or your eqhost.txt file, it should only take about 30 seconds or less to return with the error. But, if you are running a patched version of EQ, it can take minutes before the error pops up, if it ever does at all.

**I can get to the login screen, but I get an error about my username or password being wrong.**

- Either you didn't follow the play guide and setup your login server accounts properly, or your password is too long. Try using a password that is 6 characters long.

**I lost my Login Server and/or Forum Account username and/or password. What can I do about that?**

- Recovering usernames and/or passwords is covered in the LoginInformationRecovery page.

**I can log into the Server Select screen, but when I get there, no servers are showing up. It is just a blank list.**

- This usually means there is a network problem. Either your network is blocking port 5998 or your router may just be having issues that need to be corrected. If you live in a dorm or are playing from a public network, it is probably going through a proxy and that means they are most likely blocking port 5998, so you won't be able to play. If you are playing from home and have control of your internet connection, then the problem is probably either with your router/modem or with your PC. First, make sure that you don't have a firewall or any other security programs running that might block your connectivity in any way. Next, make sure you aren't forwarding port 5998 to any PCs on your network (this includes port range forwarding that would include port 5998 in the range). If not, next you want to try powering down your modem and router. Then power up your modem and wait until it gets a connection. Next, power up your router and wait for it to connect. Last, reboot your PC and try connecting to EQEmu again. If that still isn't working, then there is a good chance that you need to reset your router or router/modem back to factory defaults. Most modems have a sunken in button that you can hold down to reset it to defaults. Check your product documentation for how to do it. Once that is done, set up your router again and try connecting to EQEmu again. It should be working now, but if not, there may be an issue with the routing from your ISP or your router may just be going bad.

**I can log into the Server Select screen, but when I try to connect, the screen goes black and then goes to the login screen again.**

- 

There are multiple reasons that could be causing this. Here are some of them:

- 

Most likely you are running the wrong version of Everquest. Only Legal copies of Everquest completely unpatched will work. See our list of supported ClientVersions to validate your client should be compatible.

- You may want to try other servers to make sure that it isn't a problem on that particular server. Some servers only support older clients, but Titanium should work for all servers.

- If you live in a dorm or are playing at work, you might be using a proxy that is blocking port 5998, which means you won't be able to connect.

- If you are running a P2P or Torrent program, it might be using all of your bandwidth. Try turning them all off.

- You may have a firewall that is blocking EQ. Disable all firewalls.

- If you are running a Dual Core CPU or Windows Vista, you will probably need to read the following post and apply at least one of the fixes listed in it: http://www.eqemulator.net/forums/showthread.php?t=25327∞

- You may need to adjust your Windows Desktop and/or your Everquest Resolution settings.

- Make sure your drivers are up to date for your Video Card.

- If you have sound enabled, make sure your sound card is working.

- Try resetting your router. If that doesn't help, try connecting your PC directly to your cable/dsl modem and see if that helps.

- If you previously had another version of EQ installed and installed SoF over the old install (even if you uninstalled EQ before-hand), you will need to uninstall EQ again and delete the Everquest install folder completely, and then install SoF again from scratch. Otherwise, simply installing SoF to a new/different folder than your current EQ install works just fine.

**I am having weird choppiness/warping when I play and/or getting disconnected very often.**

- Most likely you have a Dual or Quad Core CPU. You will want to read the following post for some suggestions:

- http://www.eqemulator.net/forums/showthread.php?t=25327

**I tried making a character, but when I was done, it just disconnected me.**

- This is because there is a time limit at character select/creation. Try being faster when making your character.

**Sometimes when I play my ping times are very high and/or I lag really bad.**

- Either you have a slow connection, or are downloading large files, or the server may be having resource issues. This is more likely when many players are on the server.

**I found a bug on the server that I play on. What should I do?**

- Most likely the bug you found is specific to that server. If so, post it on that server's forums or /petition a GM about it.

**Often when I am playing 2 or more characters at once, some of them will get disconnected almost every time I zone.**

- This is because you shouldn't play more than 1 character per account at the same time. You can easily make multiple accounts.

**The server I play on Limits the number of players allowed per-IP. More than 1 person plays from my IP. How can we get it increased?**

- EQEmu has no control over the IP limit settings of individual servers. Please make the IP limit increase request to the GM(s)/Admin(s) of the server you play on. Check their website/forums and post there with your request if possible. To find their website, please either check the MOTD on the server, ask in /ooc, or refer to the server list here and click the "view" link next to the server you play on:

- http://www.eqemulator.org/index.php?pageid=serverlist

- If the server has a website, it is most likely on that page.

**Everquest works fine, but all of the fonts are hard to read due to being a bit blocky or garbled. How do I correct this so fonts look normal?**

- If your fonts are showing up oddly, you are probably running an LCD monitor and not running EQ at your monitor's native resolution. Try running in Windowed mode and see if that corrects the font issues (ALT+ENTER). If that fixes it, then just make sure when you are running in full screen mode, you are running at the native resolution of your monitor.

**I run Windows Vista/7 and am unable to type certain characters in the chat window such as: + = [ ] { } " '. How is this fixed?**

- Open Device Manager

- Click on "Keyboards" to open the tree.

- Right-Click on "Microsoft eHome MCIR 109 Keyboard" and choose "Uninstall", then click "Ok".

- Right-Click on "Microsoft eHome MCIR Keyboard" and choose "Uninstall", then click "Ok".

- Right-Click on "Microsoft eHome Remote Control Keyboard keys" and choose "Uninstall", then click "Ok".

- Click on "Human Interface Devices" to open the tree.

- Right-Click on "Microsoft eHome Infrared Transceiver" and choose "Disable", then click "Ok".

- Restart Everquest.

**I am still having a problem with playing that wasn't answered here. What should I do?**

- First try reading and searching the forums. If you still can't find the solution, you should make a post in one of the support threads with as many details as possible about your issue. Make sure to post in the right section that is related to your issue (General Support, Spell Support, Windows Server Support, Linux Server Support or Mini Login Support).

## Server Administrator Support¶

**I setup the server, but when I click the start.bat shortcut, the window opens and closes so fast that I can't even read it.**

- You should try running the world.exe from the command prompt and watch for errors from there.

**I ran the world.exe from the command prompt and it stops after giving an error about being unable to connect to the database.**

- Make sure you have the config file setup properly. If you are certain that it is set correctly, then make sure you ran the following command from the mysql prompt in your database and set your new password to what you want it to be:

- set password for 'root'@'localhost' = OLD_PASSWORD('newpwd');

**My server loads up and everything looks ok accept I can't cast any detrimental spells and mobs won't aggro even if they are KoS.**

- This is because you are missing the .map file. These files need to be put in your eqemu/maps directory. They tell the server the 3D layout of the zone and they are not the same as the map files in your Everquest directory for in game maps. 

**My server loads up and I can log in, but I am unable to move or barely at all unless I have levitate on.**

- Make sure you have all of the required SQL added to your server. Check through the change logs for the required SQL.

**My server loads up and I can log in from my LAN, but everyone outside of my network gets disconnected when they try to connect to the server.**

- Make sure you have Port RANGE Forwarding setup to forward ports 7000 to 7500, 9000 to 9000 and optionally 9080 to 9080 to your server's LAN IP Address.

**I edited items, or factions and they don't seem to be showing up or working properly.**

- These changes only take effect after the server is restarted. Some other changes require zones to be reset to take effect.

**I have heard that Linux is better than Windows for running Emulator servers. Is it recommended for everyone to use?**

- If you are a technical person, then yes, you would probably benefit from running your server on Linux. If you are not technical, then you probably want to stick with Windows. The main benefit of Linux is greater stability and less system resource usage.

**I run a Windows server and my Logs directory is huge. Is there a way to turn off logging?**

- You can simply rename the eqemu/logs directory to stop the logs, or you can edit the log.ini file by following the wiki for it.

**I am having a problem with some quests. If I turn in an item, the NPC doesn't react at all and just eats the item.**

- Make sure you have moved the Plugins files from your Quests directory into the eqemu/plugins folder.

**My server was running fine before I updated to the latest Source/Binaries and now something is not working properly.**

- Make sure that you added all required SQL files as noted in the changelog.txt file. Check the SVN folder here for the full list:

- http://code.google.com/p/projecteqemu/source/browse/#svn/trunk/EQEmuServer/utils/sql/svn∞

- You will want to source in any updates that occurred between the revision your server was last running and the revision it is running now. For example; If your server was running Rev1143 and you upgraded it to Rev1200, you will need to source the 1195_account_suspendeduntil.sql into your db and can optionally source 1144_optional_rule_return_nodrop.sql as well.

**My EQEmu Web Tool gives an error when trying to connect to it and does not prompt for login.**

- First, make sure you have the HTTP service enabled in your eqemu_config.xml

- If it is enabled and still not functioning, make sure you have the mime.types file in your server folder.

- Also, make sure you have port 9080 open in your router/firewall and/or forwarded.

- Last, make sure your EQEmu server is started, or the tool will not function.

**My EQEmu Web Tool gives a login prompt, but I am not able to authenticate.**

- First, you must be logging into the Web Tool on a GM account (using your normal Login Server account name), as normal accounts will not work.

Second, you must set a password in your account table password field for the account you want access on. You can hash the password so it is encrypted.

More to be added as needed.

---

## Play Guide

*Source: play/play-guide/index.html*

# Play Guide¶

Info

This guide will take you through the steps necessary to play on an EQEmulator Server. 

## Supported Clients¶

Warning

**EverQuest clients are the intellectual property of the Daybreak Game Company, LLC.** Copies of Daybreak Game Company intellectual property are not sourced through the EQEmulator project, nor should you provide unlicensed copies through any EQEmulator asset.

| 

Titanium Edition 
| Secrets of Faydwer 
| Seeds of Destruction 
| Underfoot 
| Rain of Fear (Most used) 

| 
| 
| 
| 
| 

- **Everquest** Titanium Edition (Retail from the CDs)

- **Everquest** Secrets of Faydwer (Retail from the CDs/DVDs)

- **Everquest** Seeds of Destruction (No longer available by legal means)

- **Everquest** Underfoot (No longer available by legal means)

- **Everquest** Rain of Fear (RoF - Build Date of Dec 10 2012 17:35:44) Download-Only from Steam (No longer available by legal means)

- **Everquest** Rain of Fear (RoF2 - Build Date of May 10 2013 23:30:08) Download-Only from Steam (No longer available by legal means)

Note

Some servers may only allow earlier version of clients (Left earliest, right latest)

Info

Most servers will allow most clients simultaneously, the earlier clients may not have the features or zone capabilities that later clients do, however.

## Step 1) Installing¶

### Titanium & Secrets of Faydwer¶

Info

Install Titanium or Secrets of Faydwer from the disks or Seeds of Destruction/Underfoot from your local copy the Steam download. **Do NOT patch live**.

Titanium/SoF Note Some users with AMD Athlon™ 64 X2 Dual Core Processors have reported a speed issue with the client.

If you still have Dual Core CPU issues or other issues with starting Everquest, see the Frequently Asked Questions. Note that the SoD and later clients do not have Multi-CPU issues like previous clients.

### Seeds of Destruction, Underfoot, Rain of Fear¶

Warning

It is HIGHLY recommended that you make a backup copy of your SoD/UF/RoF/RoF2 download folder before taking any further actions in the case that your download gets corrupted or patched by mistake. 

Do not attempt to run Everquest using the shortcut on your Desktop before making a backup or it will patch your client and break it for EQEmu!

To make a backup, simply copy the installed Everquest folder to some other place on your hard drive. Naming it something like C:\Everquest_SoD or C:\Everquest_RoF2 would make it easy to identify.

Note

If using the SoD, UF, RoF, or RoF2 client from Steam, it will get installed into one of the following folders by default:

**On 32bit Windows:**

`C:\Program Files\Steam\steamapps\common\EverQuest`

**Or for 64bit Vista/7:**

`C:\Program Files (x86)\Steam\steamapps\common\EverQuest`

## Step 2) Forum Account¶

If you have not already done so, you will need to register an account with the EQEmulator Forums∞. Click the "Register" link at the top left of the page. Follow the prompts that are displayed and enter the required information: username, password, email address, etc. Make sure you use a valid email address as your new account needs to be verified. Check your email and validate your account. If you do not receive a validation code, please PM an Administrator in the IRC channel.

## Step 3) Login Server Account¶

You will now need to create a **Login Server account** that you will use log into the EQEmulator Loginserver.

Please go to the Login Server page (located under Miscellaneous in your UserCP).

Select "Create a LS Account."

Fill out the fields and proceed. 

Info

Please note that your EQEmulator Forum account and EQEmulator Login Server account are totally seperate; you should use a different username/password combination for each.

Your Login Server Account passwords are now recoverable as of March 2014, but you must setup verification right away.

Verification

## Step 4) EQHost File¶

Info

In order for your client to connect to the **EQEmulator Login Server** (and not SOE's EQLive Login Server), you will need to change your **eqhost.txt** file to point at the correct location. 

Go into your EverQuest directory and locate the eqhost.txt file. 

Replace the contents of the file with the following (Remove any trailing spaces)

Eqhost

As of November 2021; most of the community has been going through ProjectEQ Loginserver for stability reasons even when your Loginserver accounts are EQEmulator accounts

Titanium & Secrets of Faydwer

```
`[LoginServer]
# Host=login.eqemulator.net:5998
Host=login.projecteq.net:5998
`
```

Seeds of Destruction, Underfoot, Rain of Fear

```
`[LoginServer]
# Host=login.eqemulator.net:5999
Host=login.projecteq.net:5999
`
```

## Step 5) Creating Shortcut¶

There are the generic instructions for configuring your client for connection to an EQEmu Server.

Warning

Do not launch your EverQuest client prior to making these adjustments, as it will attempt to patch and you will have to reinstall the client from scratch!

Navigate to your EverQuest client directory and right-click on the eqgame.exe application.

Shortcut

Choose the **Send To** option, and choose **Desktop (create shortcut)**.

Properties

Right-click on the shortcut you created on your desktop, and select the ***Properties*** option.

In the **Target** field, add `patchme`, to the end of the line

**Examples**

`"C:\Program Files\Everquest\eqgame.exe" patchme`

`C:\Everquest\eqgame.exe patchme`

## Step 6) Playing¶

That's it! You're ready to play now. Double-click that shortcut you just created, and login using the Login Server Account that you created in Step 3.

Info

If there are any issues or questions after completing the steps in this guide, please review the Troubleshooting FAQ below and the Frequently Asked Questions page. You should also search the Forums for answers before posting any questions. Another option for support is to join the EQEmulator IRC Support Channel and ask a question, and then stay logged in there and wait for a response (which can take a while).

## Custom Server Files¶

Note

Some servers have custom files to download so make sure you check in with the server that you are playing with. Normally they will post instructions on their site or their message of the day when you log in. Most servers at least have a spells text file to download in order for spells to work properly.

## Community¶

Find us on Discord!

## FAQs¶

Question

### Can I use the anniversary edition or other expansions?¶

No. As the it says above, you can only use Titanium, Secrets of Faydwer, Seeds of Destruction, Underfoot, or Rain of Fear at this time. 

Other versions like platinum, anniversary, and trilogy **will not work**. 

EQEmu compatibility is created for very specific versions of the eqgame.exe file.

Every time SOE releases a patch, it is a different version.

Question

### Can I use third party software like MacroQuest?¶

Check the rules for the server you play on.

Question

### Can I use custom UIs?¶

Yes! Most custom UIs work with EMU, however there may be a few flaws, where as live uses corrupt resist and the rest timer where EMU doesn't, which would show "unknown" in your skin where it doesn't exist yet in EMU.

Question

### Is EverQuest Emulator Free?¶

100% free to play, however you have to acquire a compatible version of Everquest by yourself.

Question

### Can I download EverQuest Titanium or Secrets of Faydwer?¶

No, only the retail installations of either of the supported versions will work. Illegal downloads of them are not supported by the team here and are a bannable offense if discussed on the forums.

Question

### Is there a list of servers I can see and if they are legit, semi-legit, or non-legit and other stuff?¶

Yes see this page for EQEmulator Loginserver 

See http://login.projecteq.net/ for the ProjectEQ Loginserver

---

## Underfoot Missing Files

*Source: play/underfoot-missing-files/index.html*

# Underfoot Missing Files¶

## Description¶

**Getting the Underfoot (UF) client is simple, since it can be purchased and downloaded from Steam. The only downside to the Underfoot client is that it is missing certain files that you will need to replace to make the client as fully functional as the SoD client.**

Once you purchase Underfoot from Steam and have it downloaded, you should make a backup copy of the entire folder immediately and store it somewhere else on your system. Next you should make a copy of the folder where ever you want it to be to played from, C:\EQ\Underfoot is a good location. Playing from the Steam folder can ruin your install if Steam updates the download, so you will not want to do that.

- You will need at least a Titanium or older install for the zones that have been changed or no longer exist on Live. Some examples of these zones are East and West Commonlands, Nektulos, North and South Ro, The Oasis, and East and West Freeport. The only place to find these files is from a Titanium or older install. Seeds of Destruction (SoD) and newer clients do not have these files at all. 

- The other files you will need are files that should be in a normal EverQuest install but are missing from the Steam download for some reason. Most, but all of these files can also be taken from a Titanium install, but as more things are discovered it may be required to get them from a newer source. Once Underfoot has all of its missing files, it should run as well as the SoD client.

- There is no way to help you get the older missing files except from the original discs such as Titanium or another box set. Titanium is the best source, but anything from the Gold box or newer should have most of them. If you are really desperate, you could likely salvage most of the files from the Trilogy discs and then the rest from the PoP expansion discs.

- For the missing/corrupt files that can still be gotten from a Live install, you can now get a fully patched to live client by signing up for the 14 day free trial. 

#### Update August 18, 2011 ¶

The old Escape To Norrath trial was never useful because it was only a partial client. But Sony has now changed the trial to be a trial on the actual live servers. Go make a new SOE account and hit the trial button. It will download the full client (6.5GB). To speed up the download, you can take your existing UF install and copy all of those files to the folder where you told the live install to go. That will extremely shorten your download time. Note that the steps below describe how to copy your UF install folder and create a new Live folder that will be used to attain the files needed for UF. NEVER patch your UF install folder or it will fail to work with EQEmu!

**These steps were used on August 18, 2011: **

- Locate the Underfoot install. Mine resides in C:\EQ\Everquest_UF.

- Make a new folder for the Live install, C:\EQ\Everquest_Live is a good location.

- Copy everything from the Underfoot folder to the Live folder.

- While that is copying, open your browser and go to http://www.everquest.com∞ and click on Everquest and then look for the button for the free trial.

- Create a new account. An existing account will not work. When it tells you to download the installer, ignore it.

- Go to the Live folder you made and double click on the launchpad.exe program.

- Login with the new account you just created.

- Wait for it to finish patching.

- You are done. I recommend noting the expiration date of your trial and patching again one last time before it expires to make sure you have everything as of that date.

## **Missing Files**¶

- Here is a list compiled from different posts of files missing in the UF client that can be copied over from Live or another client like SoF or even some from Titanium:

- **dbstr_us.txt** - This one is the most important, otherwise many AAs and spell descriptions will not show.

- **dkm_anims.eqg** - This one is important for playing Male Drakkin, otherwise they don't animate.

These files are required for revamped or removed zones to show everything correctly, and can all be found in a Titanium installation. These are all original zones that were changed and it is likely that even an original EverQuest disc would work, but no one has reported testing it out.

```
` File Date File Size File Name
2005-10-17 11:37 178030 blackburrow_2_obj.s3d
2005-10-17 11:30 2520 freportw_sounds.eff
2005-10-17 11:28 163048 freportn.xmi
2005-10-17 11:29 1809356 freportn_chr.s3d
2005-10-17 11:29 102 freportn_sndbnk.eff
2005-10-17 11:29 1344 freportn_sounds.eff
2005-10-17 11:29 68840 freportw.xmi
2005-10-17 11:30 2628677 freportw_chr.s3d
2005-10-17 11:29 184 freportw_sndbnk.eff
2005-10-17 11:35 24 freportw_assets.txt
2005-10-17 11:28 26548 nro.xmi
2005-10-17 11:28 2569236 nro_chr.s3d
2005-10-17 11:34 84 nro_chr.txt
2005-10-17 11:33 301167 nro_obj2.s3d
2005-10-17 11:28 137 nro_sndbnk.eff
2005-10-17 11:28 2940 nro_sounds.eff
2005-10-17 11:30 73800 nro2_chr.s3d
2005-10-17 11:30 2856 oasis_sounds.eff
2005-10-17 11:29 73802 oasis2_chr.s3d
2005-10-17 11:33 373067 oasis_2_obj.s3d
2005-10-17 11:30 2544081 oasis_chr.s3d
2005-10-17 11:34 52 oasis_chr.txt
2005-10-17 11:29 153 oasis_sndbnk.eff
2005-10-17 11:39 19505 oot_chr2.s3d
2005-10-17 11:39 512580 rathemtn_chr2.s3d
2005-10-17 11:37 2856 soltemple_sounds.eff
2005-10-17 11:36 244516 soltemple_chr.s3d
2005-10-17 11:37 85 soltemple_sndbnk.eff
2005-10-17 11:30 2772 sro_sounds.eff
2005-10-17 11:33 297528 sro_2_obj.s3d
2005-10-17 11:29 2484461 sro_chr.s3d
2005-10-17 11:35 21 sro_chr.txt
2005-10-17 11:29 178 sro_sndbnk.eff
`
```

- **These files are required because they are simply missing or incomplete from the Underfoot download. Some can be obtained from Titanium and some from SoD. The Live client is also a valid source for all of the below files.**

```
` File Date File Size File Name
--------->From Titanium, SoD or Live<-----------
2005-10-17 11:34 1944364 bas.eqg
2005-10-17 11:28 2415064 blackburrow_chr.s3d
2005-10-17 11:39 2743860 bothunder.mp3
2005-10-17 11:39 7127397 bothunder.s3d
2005-10-17 11:39 3090804 bothunder_chr.s3d
2005-10-17 11:41 34 bothunder_chr.txt
2005-10-17 11:39 3988692 bothunder_obj.s3d
2005-10-17 11:38 77 dreadlands_chr.txt
2005-10-17 11:38 3144939 frozenshadow_chr.s3d
2005-10-17 11:30 873955 gequip3.s3d
2005-10-17 11:44 262 gukg_chr.txt
2005-10-17 11:42 2239485 gukh.s3d
2005-10-17 12:42 335 gunthak_chr.txt
2005-10-17 11:40 7481382 pofire_chr.s3d
2005-10-17 11:40 8906873 postorms.s3d
2005-10-17 11:41 2431425 powater_chr.s3d
2005-10-17 11:45 17836 qvic.emt
2005-10-17 11:44 3446081 qvic.s3d
2005-10-17 11:45 212 qvic_chr.txt
2005-10-17 11:44 3088488 qvic_obj.s3d
----->From SoD or Live (these are from Live)<------
2010-03-26 21:07 2269493 dest_sphere_shield.eqg
2010-03-26 16:16 1702782 discordtower.zon
2010-03-26 16:14 8825512 dkm_anims.eqg
2010-03-26 16:34 6904245 freeportacademy.eqg
2010-03-26 20:16 55 poknowledge_assets.txt
2011-02-01 01:15 176612 spellsnew.eff
2011-02-01 09:50 158261 RaceData.txt
2011-02-02 17:37 4552251 dbstr_us.txt
2011-02-03 22:27 18971769 spells_us.txt
2011-02-04 20:32 1402768 mpu.eqg
`
```

- Alternatively to copying these files over 1 by 1 from another client, you can simply select all files in another client such as a EQLive patched client install folder and paste them into the Underfoot folder. Then, when prompted if you want to replace existing files, just set it to say no to all, and only missing files will be copied over. Then, the only thing that has to be manually copied over is the dbstr_us.txt file.

- If there are more missing files that are not listed here, feel free to update this Wiki page to add the additional file names to the list, or any extra helpful details.

---

## Tags

*Source: tags/index.html*

# Tags¶

Following is a list of relevant tags:

## 

Discord¶

 - 
 
 Discord Logging

 - 
 
 Player Event Logging

## 

Logging¶

 - 
 
 Discord Logging

 - 
 
 Logging Categories

 - 
 
 Logging System

 - 
 
 Player Event Logging

## 

Logs¶

 - 
 
 Discord Logging

 - 
 
 Logging Categories

 - 
 
 Logging System

 - 
 
 Player Event Logging

---

