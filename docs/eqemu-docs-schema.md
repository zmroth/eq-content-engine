# EQEmu Documentation: Database Schema

> Extracted from docs.eqemu.dev - 233 pages

---

## aa_ability

*Source: schema/aas/aa_ability/index.html*

# aa_ability¶

## Relationships¶

```
erDiagram
 aa_ability {
 int first_rank_id
 }
 aa_ranks {
 intunsigned id
 }
 aa_ability ||--o{ aa_ranks : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| first_rank_id 
| aa_ranks 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique AA Identifier 

| name 
| text 
| Name 

| category 
| int 
| AA Category 

| classes 
| int 
| Classes Bitmasks 

| races 
| int 
| Races 

| drakkin_heritage 
| int 
| Drakkin Heritage: 127 = All 

| deities 
| int 
| Deities 

| status 
| int 
| Minimum Status 

| type 
| int 
| AA Type 

| charges 
| int 
| Number of Charges 

| grant_only 
| tinyint 
| Grant Only Flag: 0 = No, 1 = Yes 

| first_rank_id 
| int 
| First Rank Identifier 

| enabled 
| tinyint 
| Enabled: 0 = No, 1 = Yes 

| reset_on_death 
| tinyint 
| Reset on Death: 0 = False, 1 = True 

| auto_grant_enabled 
| tinyint 
|

---

## aa_rank_effects

*Source: schema/aas/aa_rank_effects/index.html*

# aa_rank_effects¶

## Relationships¶

```
erDiagram
 aa_rank_effects {
 intunsigned rank_id
 }
 aa_ranks {
 intunsigned id
 }
 aa_rank_effects ||--o{ aa_ranks : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| rank_id 
| aa_ranks 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| rank_id 
| int 
| Rank Identifier 

| slot 
| int 
| AA Slot 

| effect_id 
| int 
| Spell Effect Identifier 

| base1 
| int 
| First Base Value 

| base2 
| int 
| Second Base Value

---

## aa_rank_prereqs

*Source: schema/aas/aa_rank_prereqs/index.html*

# aa_rank_prereqs¶

## Relationships¶

```
erDiagram
 aa_rank_prereqs {
 int aa_id
 intunsigned rank_id
 }
 aa_ranks {
 intunsigned id
 }
 aa_rank_prereqs ||--o{ aa_ranks : "One-to-One"
 aa_rank_prereqs ||--o{ aa_ranks : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| aa_id 
| aa_ranks 
| id 

| One-to-One 
| rank_id 
| aa_ranks 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| rank_id 
| int 
| Rank Identifier 

| aa_id 
| int 
| AA Identifier 

| points 
| int 
| Cost in AA Points

---

## aa_ranks

*Source: schema/aas/aa_ranks/index.html*

# aa_ranks¶

## Relationships¶

```
erDiagram
 aa_ranks {
 intunsigned id
 }
 aa_ability {
 int first_rank_id
 }
 aa_rank_effects {
 intunsigned rank_id
 }
 aa_rank_prereqs {
 int aa_id
 intunsigned rank_id
 }
 character_alternate_abilities {
 smallintunsigned aa_id
 intunsigned id
 }
 aa_ranks ||--o{ aa_ability : "One-to-One"
 aa_ranks ||--o{ aa_rank_effects : "One-to-One"
 aa_ranks ||--o{ aa_rank_prereqs : "One-to-One"
 aa_ranks ||--o{ aa_rank_prereqs : "One-to-One"
 aa_ranks ||--o{ character_alternate_abilities : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| id 
| aa_ability 
| first_rank_id 

| One-to-One 
| id 
| aa_rank_effects 
| rank_id 

| One-to-One 
| id 
| aa_rank_prereqs 
| aa_id 

| One-to-One 
| id 
| aa_rank_prereqs 
| rank_id 

| Has-Many 
| id 
| character_alternate_abilities 
| aa_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| AA Identifier 

| upper_hotkey_sid 
| int 
| Upper Hotkey SID 

| lower_hotkey_sid 
| int 
| Lower Hotkey SID 

| title_sid 
| int 
| Title SID 

| desc_sid 
| int 
| Description SID 

| cost 
| int 
| Cost in AA Points 

| level_req 
| int 
| Level Required 

| spell 
| int 
| Spell Identifier 

| spell_type 
| int 
| Spell Type 

| recast_time 
| int 
| Recast Timer 

| expansion 
| int 
| Expansion Identifier 

| prev_id 
| int 
| Previous Rank Identifier 

| next_id 
| int 
| Next Rank Identifier

---

## account

*Source: schema/account/account/index.html*

# account¶

## Relationships¶

```
erDiagram
 account {
 int id
 varchar name
 }
 account_flags {
 intunsigned p_accid
 }
 account_ip {
 int accid
 varchar ip
 }
 account_rewards {
 intunsigned account_id
 intunsigned reward_id
 }
 bug_reports {
 intunsigned account_id
 varchar zone
 intunsigned character_id
 varchar character_name
 }
 sharedbank {
 intunsigned acctid
 mediumintunsigned augslot1
 mediumintunsigned augslot2
 mediumintunsigned augslot3
 mediumintunsigned augslot4
 mediumintunsigned augslot5
 mediumint augslot6
 intunsigned itemid
 }
 account ||--o{ account_flags : "Has-Many"
 account ||--o{ account_ip : "Has-Many"
 account ||--o{ account_rewards : "Has-Many"
 account ||--o{ bug_reports : "Has-Many"
 account ||--o{ sharedbank : "Has-Many"

```

```
erDiagram
 account {
 int id
 varchar name
 }
 eventlog {
 varchar accountid
 varchar accountname
 varchar charname
 }
 gm_ips {
 int account_id
 varchar ip_address
 }
 hackers {
 varchar account
 varchar name
 varchar zone
 }
 petitions {
 varchar accountname
 varchar charname
 varchar lastgm
 varchar zone
 }
 account ||--o{ eventlog : "Has-Many"
 account ||--o{ gm_ips : "One-to-One"
 account ||--o{ eventlog : "Has-Many"
 account ||--o{ hackers : "Has-Many"
 account ||--o{ petitions : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| id 
| account_flags 
| p_accid 

| Has-Many 
| id 
| account_ip 
| accid 

| Has-Many 
| id 
| account_rewards 
| account_id 

| Has-Many 
| id 
| bug_reports 
| account_id 

| Has-Many 
| id 
| sharedbank 
| acctid 

| Has-Many 
| id 
| eventlog 
| accountid 

| One-to-One 
| id 
| gm_ips 
| account_id 

| Has-Many 
| name 
| eventlog 
| accountname 

| Has-Many 
| name 
| hackers 
| account 

| Has-Many 
| name 
| petitions 
| accountname 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Account Identifier 

| name 
| varchar 
| Name 

| charname 
| varchar 
| Character name last logged in on this account. 

| sharedplat 
| int 
| Platinum in Shared Bank. 

| password 
| varchar 
| Private loginserver password. 

| status 
| int 
| Status 

| ls_id 
| varchar 
| Loginserver ID 

| lsaccount_id 
| int 
| Loginserver Account Identifier 

| gmspeed 
| tinyint 
| GM Speed: 0 = Disabled, 1 = Enabled 

| invulnerable 
| tinyint 
| Invulnerable: 0 = False, 1 = True 

| flymode 
| tinyint 
| Fly Mode 

| ignore_tells 
| tinyint 
| Ignore Tells: 0 = False, 1 = True 

| revoked 
| tinyint 
| OOC Revoked: 0 = False, 1 = True 

| karma 
| int 
| Karma 

| minilogin_ip 
| varchar 
| Minilogin IP Address 

| hideme 
| tinyint 
| Hide Me: 0 = Disabled, 1 = Enabled 

| rulesflag 
| tinyint 
| Rules Flag 

| suspendeduntil 
| datetime 
| Time Suspension of the Account ends 

| time_creation 
| int 
| Time Creation UNIX Timestamp 

| ban_reason 
| text 
| Ban Reason 

| suspend_reason 
| text 
| Suspension Reason 

| crc_eqgame 
| text 
| CRC for EQGame.exe 

| crc_skillcaps 
| text 
| CRC for SkillCaps file 

| crc_basedata 
| text 
| CRC for BaseData file

---

## account_flags

*Source: schema/account/account_flags/index.html*

# account_flags¶

## Relationships¶

```
erDiagram
 account_flags {
 intunsigned p_accid
 }
 account {
 int id
 varchar name
 }
 account_flags ||--o{ account : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| p_accid 
| account 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| p_accid 
| int 
| Account Identifier 

| p_flag 
| varchar 
| Name 

| p_value 
| varchar 
| Value

---

## account_ip

*Source: schema/account/account_ip/index.html*

# account_ip¶

## Relationships¶

```
erDiagram
 account_ip {
 int accid
 varchar ip
 }
 banned_ips {
 varchar ip_address
 }
 gm_ips {
 int account_id
 varchar ip_address
 }
 ip_exemptions {
 varchar exemption_ip
 }
 account_ip ||--o{ banned_ips : "One-to-One"
 account_ip ||--o{ gm_ips : "One-to-One"
 account_ip ||--o{ ip_exemptions : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| ip 
| banned_ips 
| ip_address 

| One-to-One 
| ip 
| gm_ips 
| ip_address 

| One-to-One 
| ip 
| ip_exemptions 
| exemption_ip 

## Schema¶

| 

Column 
| Data Type 
| Description 

| accid 
| int 
| Account Identifier 

| ip 
| varchar 
| IP Address 

| count 
| int 
| Number of times logged in from this IP 

| lastused 
| timestamp 
| Timestamp of when account was last logged in

---

## account_rewards

*Source: schema/account/account_rewards/index.html*

# account_rewards¶

## Relationships¶

```
erDiagram
 account_rewards {
 intunsigned account_id
 intunsigned reward_id
 }
 veteran_reward_templates {
 intunsigned claim_id
 intunsigned item_id
 }
 account_rewards ||--o{ veteran_reward_templates : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| reward_id 
| veteran_reward_templates 
| claim_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| account_id 
| int 
| Account Identifier 

| reward_id 
| int 
| Veteran Reward Identifier 

| amount 
| int 
| Amount

---

## sharedbank

*Source: schema/account/sharedbank/index.html*

# sharedbank¶

## Relationships¶

```
erDiagram
 sharedbank {
 intunsigned acctid
 mediumintunsigned augslot1
 mediumintunsigned augslot2
 mediumintunsigned augslot3
 mediumintunsigned augslot4
 mediumintunsigned augslot5
 mediumint augslot6
 intunsigned itemid
 }
 account {
 int id
 varchar name
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 sharedbank ||--o{ account : "One-to-One"
 sharedbank ||--o{ items : "One-to-One"
 sharedbank ||--o{ items : "One-to-One"
 sharedbank ||--o{ items : "One-to-One"
 sharedbank ||--o{ items : "One-to-One"
 sharedbank ||--o{ items : "One-to-One"
 sharedbank ||--o{ items : "One-to-One"
 sharedbank ||--o{ items : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| acctid 
| account 
| id 

| One-to-One 
| augslot1 
| items 
| id 

| One-to-One 
| augslot2 
| items 
| id 

| One-to-One 
| augslot3 
| items 
| id 

| One-to-One 
| augslot4 
| items 
| id 

| One-to-One 
| augslot5 
| items 
| id 

| One-to-One 
| augslot6 
| items 
| id 

| One-to-One 
| itemid 
| items 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| acctid 
| int 
| Unique Account Identifier 

| slotid 
| mediumint 
| Slot Identifier 

| itemid 
| int 
| Item Identifier 

| charges 
| smallint 
| Charges 

| augslot1 
| mediumint 
| Augment Slot 1 

| augslot2 
| mediumint 
| Augment Slot 2 

| augslot3 
| mediumint 
| Augment Slot 3 

| augslot4 
| mediumint 
| Augment Slot 4 

| augslot5 
| mediumint 
| Augment Slot 5 

| augslot6 
| mediumint 
| Augment Slot 6 

| custom_data 
| text 
| Custom Data

---

## banned_ips

*Source: schema/admin/banned_ips/index.html*

# banned_ips¶

## Relationships¶

```
erDiagram
 banned_ips {
 varchar ip_address
 }
 account_ip {
 int accid
 varchar ip
 }
 banned_ips ||--o{ account_ip : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| ip_address 
| account_ip 
| ip 

## Schema¶

| 

Column 
| Data Type 
| Description 

| ip_address 
| varchar 
| IP Address 

| notes 
| varchar 
| Ban reason

---

## bug_reports

*Source: schema/admin/bug_reports/index.html*

# bug_reports¶

## Relationships¶

```
erDiagram
 bug_reports {
 intunsigned account_id
 varchar zone
 intunsigned character_id
 varchar character_name
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 account {
 int id
 varchar name
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 bug_reports ||--o{ zone : "One-to-One"
 bug_reports ||--o{ account : "One-to-One"
 bug_reports ||--o{ character_data : "One-to-One"
 bug_reports ||--o{ character_data : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| zone 
| zone 
| short_name 

| One-to-One 
| account_id 
| account 
| id 

| One-to-One 
| character_id 
| character_data 
| id 

| One-to-One 
| character_name 
| character_data 
| name 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Bug Report Identifier 

| zone 
| varchar 
| Zone Short Name 

| client_version_id 
| int 
| Client Version Identifier 

| client_version_name 
| varchar 
| Client Version Name 

| account_id 
| int 
| Account Identifier 

| character_id 
| int 
| Character Identifier 

| character_name 
| varchar 
| Character Name 

| reporter_spoof 
| tinyint 
| Reporter Spoof 

| category_id 
| int 
| Category Identifier 

| category_name 
| varchar 
| Category Name 

| reporter_name 
| varchar 
| Reporter Name 

| ui_path 
| varchar 
| UI Path 

| pos_x 
| float 
| Position X Coordinate 

| pos_y 
| float 
| Position Y Coordinate 

| pos_z 
| float 
| Position Z Coordinate 

| heading 
| int 
| Heading Coordinate 

| time_played 
| int 
| Time Played in Seconds 

| target_id 
| int 
| Target Identifier 

| target_name 
| varchar 
| Target Name 

| optional_info_mask 
| int 
| Optional Info Mask: 0 = False, 1 = True 

| _can_duplicate 
| tinyint 
| Can Duplicate: 0 = False, 1 = True 

| _crash_bug 
| tinyint 
| Crash Bug 

| _target_info 
| tinyint 
| Target Info 

| _character_flags 
| tinyint 
| Character Flags 

| _unknown_value 
| tinyint 
| Unknown 

| bug_report 
| varchar 
| Bug Report 

| system_info 
| varchar 
| System Information 

| report_datetime 
| datetime 
| Report Datetime 

| bug_status 
| tinyint 
| Bug Status 

| last_review 
| datetime 
| Last Review Datetime 

| last_reviewer 
| varchar 
| Last Reviewer 

| reviewer_notes 
| varchar 
| Reviewer Notes

---

## bugs

*Source: schema/admin/bugs/index.html*

# bugs¶

## Relationships¶

```
erDiagram
 bugs {
 varchar zone
 varchar name
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 bugs ||--o{ zone : "One-to-One"
 bugs ||--o{ character_data : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| zone 
| zone 
| short_name 

| One-to-One 
| name 
| character_data 
| name 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Bug Identifier 

| zone 
| varchar 
| Zone Short Name 

| name 
| varchar 
| Player Name 

| ui 
| varchar 
| UI 

| x 
| float 
| X Coordinate 

| y 
| float 
| Y Coordinate 

| z 
| float 
| Z Coordinate 

| type 
| varchar 
| Type 

| flag 
| tinyint 
| Flag 

| target 
| varchar 
| Target when reported 

| bug 
| varchar 
| Bug reported 

| date 
| date 
| Date when reported 

| status 
| tinyint 
| [Account Status of Reporter](../../../../server/player/status-levels

---

## chatchannel_reserved_names

*Source: schema/admin/chatchannel_reserved_names/index.html*

# chatchannel_reserved_names¶

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Chat Channel Reserved Name Identifier 

| name 
| varchar 
| Name

---

## chatchannels

*Source: schema/admin/chatchannels/index.html*

# chatchannels¶

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Chat Channel Identifier 

| name 
| varchar 
| Name 

| owner 
| varchar 
| Owner Character Identifier 

| password 
| varchar 
| Password 

| minstatus 
| int 
| Minimum Status

---

## command_settings

*Source: schema/admin/command_settings/index.html*

# command_settings¶

## Schema¶

| 

Column 
| Data Type 
| Description 

| command 
| varchar 
| Unique Command Identifier 

| access 
| int 
| Required Status 

| aliases 
| varchar 
| Aliases

---

## command_subsettings

*Source: schema/admin/command_subsettings/index.html*

# command_subsettings¶

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Subcommand Identifier 

| parent_command 
| varchar 
| Parent Command 

| sub_command 
| varchar 
| Subcommand Identifier 

| access_level 
| int 
| Required Status 

| top_level_aliases 
| varchar 
| Top Level Aliases

---

## db_version

*Source: schema/admin/db_version/index.html*

# db_version¶

## Schema¶

| 

Column 
| Data Type 
| Description 

| version 
| int 
| Database Version 

| bots_version 
| int 
| Bots Version

---

## discord_webhooks

*Source: schema/admin/discord_webhooks/index.html*

# discord_webhooks¶

## Relationships¶

```
erDiagram
 discord_webhooks {
 int id
 }
 logsys_categories {
 int discord_webhook_id
 }
 discord_webhooks ||--o{ logsys_categories : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| id 
| logsys_categories 
| discord_webhook_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Webhook Identifier 

| webhook_name 
| varchar 
| Webhook Name 

| webhook_url 
| varchar 
| Webhook URL 

| created_at 
| datetime 
| Created At 

| deleted_at 
| datetime 
| Deleted At

---

## discovered_items

*Source: schema/admin/discovered_items/index.html*

# discovered_items¶

## Relationships¶

```
erDiagram
 discovered_items {
 varchar char_name
 intunsigned item_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 discovered_items ||--o{ character_data : "One-to-One"
 discovered_items ||--o{ items : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| char_name 
| character_data 
| name 

| One-to-One 
| item_id 
| items 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| item_id 
| int 
| Item Identifier 

| char_name 
| varchar 
| Character Name 

| discovered_date 
| int 
| Discovered Date UNIX Timestamp 

| account_status 
| int 
| Account Status

---

## eqtime

*Source: schema/admin/eqtime/index.html*

# eqtime¶

## Schema¶

| 

Column 
| Data Type 
| Description 

| minute 
| tinyint 
| Minute 

| hour 
| tinyint 
| Hour 

| day 
| tinyint 
| Day 

| month 
| tinyint 
| Month 

| year 
| int 
| Year 

| realtime 
| int 
| Real Time

---

## eventlog

*Source: schema/admin/eventlog/index.html*

# eventlog¶

## Relationships¶

```
erDiagram
 eventlog {
 varchar accountid
 varchar accountname
 varchar charname
 }
 account {
 int id
 varchar name
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 eventlog ||--o{ account : "One-to-One"
 eventlog ||--o{ account : "One-to-One"
 eventlog ||--o{ character_data : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| accountid 
| account 
| id 

| One-to-One 
| accountname 
| account 
| name 

| One-to-One 
| charname 
| character_data 
| name 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Event Identifier 

| accountname 
| varchar 
| Account Name 

| accountid 
| int 
| Account Identifier 

| status 
| int 
| Status 

| charname 
| varchar 
| Character Name 

| target 
| varchar 
| Target 

| time 
| timestamp 
| TIme Timestamp 

| descriptiontype 
| varchar 
| Description Type 

| description 
| text 
| Description 

| event_nid 
| int 
| Event Identifier

---

## gm_ips

*Source: schema/admin/gm_ips/index.html*

# gm_ips¶

## Relationships¶

```
erDiagram
 gm_ips {
 int account_id
 varchar ip_address
 }
 account {
 int id
 varchar name
 }
 account_ip {
 int accid
 varchar ip
 }
 gm_ips ||--o{ account : "One-to-One"
 gm_ips ||--o{ account_ip : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| account_id 
| account 
| id 

| Has-Many 
| ip_address 
| account_ip 
| ip 

## Schema¶

| 

Column 
| Data Type 
| Description 

| name 
| varchar 
| Character Name 

| account_id 
| int 
| Account Identifier 

| ip_address 
| varchar 
| IP Address

---

## hackers

*Source: schema/admin/hackers/index.html*

# hackers¶

## Relationships¶

```
erDiagram
 hackers {
 varchar account
 varchar name
 varchar zone
 }
 account {
 int id
 varchar name
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 hackers ||--o{ account : "One-to-One"
 hackers ||--o{ character_data : "One-to-One"
 hackers ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| account 
| account 
| name 

| One-to-One 
| name 
| character_data 
| name 

| One-to-One 
| zone 
| zone 
| short_name 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Hacker Identifier 

| account 
| text 
| Account Identifier 

| name 
| text 
| Character Name 

| hacked 
| text 
| Hacked 

| zone 
| text 
| Zone Short Name 

| date 
| timestamp 
| Date Timestamp

---

## ip_exemptions

*Source: schema/admin/ip_exemptions/index.html*

# ip_exemptions¶

## Relationships¶

```
erDiagram
 ip_exemptions {
 varchar exemption_ip
 }
 account_ip {
 int accid
 varchar ip
 }
 ip_exemptions ||--o{ account_ip : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| exemption_ip 
| account_ip 
| ip 

## Schema¶

| 

Column 
| Data Type 
| Description 

| exemption_id 
| int 
| Exemption Identifier 

| exemption_ip 
| varchar 
| Exemption IP Address 

| exemption_amount 
| int 
| Exemption Amount

---

## level_exp_mods

*Source: schema/admin/level_exp_mods/index.html*

# level_exp_mods¶

## Schema¶

| 

Column 
| Data Type 
| Description 

| level 
| int 
| Level 

| exp_mod 
| float 
| Experience Modifier: 0.5 = 50%, 1 = 100%, 1.5 = 150% 

| aa_exp_mod 
| float 
| AA Experience Modifier: 0.5 = 50%, 1 = 100%, 1.5 = 150%

---

## logsys_categories

*Source: schema/admin/logsys_categories/index.html*

# logsys_categories¶

## Relationships¶

```
erDiagram
 logsys_categories {
 int discord_webhook_id
 }
 discord_webhooks {
 int id
 }
 logsys_categories ||--o{ discord_webhooks : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| discord_webhook_id 
| discord_webhooks 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| log_category_id 
| int 
| Unique Log Category Identifier 

| log_category_description 
| varchar 
| Log Category Description 

| log_to_console 
| smallint 
| Log to Console: 0 = False, 1 = True 

| log_to_file 
| smallint 
| Log to File: 0 = False, 1 = True 

| log_to_gmsay 
| smallint 
| Log to GMSay: 0 = False, 1 = True 

| log_to_discord 
| smallint 
| Log To Discord: 0 = False, 1 = True 

| discord_webhook_id 
| int 
| Unique Webhook Identifier

---

## name_filter

*Source: schema/admin/name_filter/index.html*

# name_filter¶

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Name Filter Identifier 

| name 
| varchar 
| Name

---

## peq_admin

*Source: schema/admin/peq_admin/index.html*

# peq_admin¶

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Account ID 

| login 
| varchar 
| Username 

| password 
| varchar 
| MD5 Encoded Password 

| administrator 
| int 
| Administrator: 0 = False, 1 = True

---

## perl_event_export_settings

*Source: schema/admin/perl_event_export_settings/index.html*

# perl_event_export_settings¶

## Schema¶

| 

Column 
| Data Type 
| Description 

| event_id 
| int 
| Unique Perl Event Identifier 

| event_description 
| varchar 
| Event Description 

| export_qglobals 
| smallint 
| Export QGlobals: 0 = False, 1 = True 

| export_mob 
| smallint 
| Export Mob: 0 = False, 1 = True 

| export_zone 
| smallint 
| Export Zone: 0 = False, 1 = True 

| export_item 
| smallint 
| Export Item: 0 = False, 1 = True 

| export_event 
| smallint 
| Export Event: 0 = False, 1 = True

---

## petitions

*Source: schema/admin/petitions/index.html*

# petitions¶

## Relationships¶

```
erDiagram
 petitions {
 varchar accountname
 varchar charname
 varchar lastgm
 varchar zone
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 account {
 int id
 varchar name
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 petitions ||--o{ character_data : "One-to-One"
 petitions ||--o{ account : "One-to-One"
 petitions ||--o{ character_data : "One-to-One"
 petitions ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| charname 
| character_data 
| name 

| One-to-One 
| accountname 
| account 
| name 

| One-to-One 
| lastgm 
| character_data 
| name 

| One-to-One 
| zone 
| zone 
| zoneidnumber 

## Schema¶

| 

Column 
| Data Type 
| Description 

| dib 
| int 
| Unknown 

| petid 
| int 
| Unique Petition Entry Identifier 

| charname 
| varchar 
| Character Name 

| accountname 
| varchar 
| Account Name 

| lastgm 
| varchar 
| Last GM 

| petitiontext 
| text 
| Petition Text 

| gmtext 
| text 
| GM Text 

| zone 
| varchar 
| Zone Short Name 

| urgency 
| int 
| Urgency 

| charclass 
| int 
| Character Class 

| charrace 
| int 
| Character Race 

| charlevel 
| int 
| Character Level 

| checkouts 
| int 
| Checkouts 

| unavailables 
| int 
| Unavailables 

| ischeckedout 
| tinyint 
| Is Checked Out: 0 = False, 1 = True 

| senttime 
| bigint 
| Sent Time UNIX Timestamp

---

## player_event_log_settings

*Source: schema/admin/player_event_log_settings/index.html*

# player_event_log_settings¶

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| bigint 
| Unique Event Identifier 

| event_name 
| varchar 
| Event Name 

| event_enabled 
| tinyint 
| Event Enabled: 0 = False, 1 = True 

| retention_days 
| int 
| Retention Days: 0 for Permanent 

| discord_webhook_id 
| int 
| Discord Webhook Identifier

---

## player_event_logs

*Source: schema/admin/player_event_logs/index.html*

# player_event_logs¶

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| bigint 
| Unique Player Event Log Identifier 

| account_id 
| bigint 
| Account Identifier 

| character_id 
| bigint 
| Character Identifier 

| zone_id 
| int 
| Zone Identifier 

| instance_id 
| int 
| Instance Identifier 

| x 
| float 
| X Coordinate 

| y 
| float 
| Y Coordinate 

| z 
| float 
| Z Coordinate 

| heading 
| float 
| Heading Coordinate 

| event_type_id 
| int 
| Event Type Identifier 

| event_type_name 
| varchar 
| Event Type Name 

| event_data 
| longtext 
| Event Data JSON 

| created_at 
| datetime 
| Created At

---

## reports

*Source: schema/admin/reports/index.html*

# reports¶

## Relationships¶

```
erDiagram
 reports {
 varchar name
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 reports ||--o{ character_data : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| name 
| character_data 
| name 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Report Identifier 

| name 
| varchar 
| Name 

| reported 
| varchar 
| Reported 

| reported_text 
| text 
| Reported Text

---

## saylink

*Source: schema/admin/saylink/index.html*

# saylink¶

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Saylink Identifier 

| phrase 
| varchar 
| Phrase

---

## start_zones

*Source: schema/admin/start_zones/index.html*

# start_zones¶

## Relationships¶

```
erDiagram
 start_zones {
 varchar content_flags
 varchar content_flags_disabled
 int start_zone
 int zone_id
 }
 content_flags {
 varchar flag_name
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 start_zones ||--o{ content_flags : "One-to-One"
 start_zones ||--o{ content_flags : "One-to-One"
 start_zones ||--o{ zone : "One-to-One"
 start_zones ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| content_flags 
| content_flags 
| flag_name 

| One-to-One 
| content_flags_disabled 
| content_flags 
| flag_name 

| One-to-One 
| start_zone 
| zone 
| zoneidnumber 

| One-to-One 
| zone_id 
| zone 
| zoneidnumber 

## Schema¶

| 

Column 
| Data Type 
| Description 

| x 
| float 
| X Coordinate 

| y 
| float 
| Y Coordinate 

| z 
| float 
| Z Coordinate 

| heading 
| float 
| Heading Coordinate 

| zone_id 
| int 
| Zone Identifier 

| bind_id 
| int 
| Bind Identifier 

| player_choice 
| int 
| Player Choice 

| player_class 
| int 
| Player Class 

| player_deity 
| int 
| Player Deity 

| player_race 
| int 
| Player Race 

| start_zone 
| int 
| Zone Identifier 

| bind_x 
| float 
| Bind X Coordinate 

| bind_y 
| float 
| Bind Y Coordinate 

| bind_z 
| float 
| Bind Z Coordinate 

| select_rank 
| tinyint 
| Select Rank: Always 50 

| min_expansion 
| tinyint 
| Minimum Expansion 

| max_expansion 
| tinyint 
| Maximum Expansion 

| content_flags 
| varchar 
| Content Flags Required to be Enabled 

| content_flags_disabled 
| varchar 
| Content Flags Required to be Disabled

---

## starting_items

*Source: schema/admin/starting_items/index.html*

# starting_items¶

## Relationships¶

```
erDiagram
 starting_items {
 varchar content_flags
 varchar content_flags_disabled
 varchar itemid
 varchar zone_id
 varchar zoneid
 }
 content_flags {
 varchar flag_name
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 starting_items ||--o{ content_flags : "One-to-One"
 starting_items ||--o{ content_flags : "One-to-One"
 starting_items ||--o{ items : "One-to-One"
 starting_items ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| content_flags 
| content_flags 
| flag_name 

| One-to-One 
| content_flags_disabled 
| content_flags 
| flag_name 

| One-to-One 
| itemid 
| items 
| id 

| One-to-One 
| zone_id 
| zone 
| zoneidnumber 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Starting Items Entry Identifier 

| class_list 
| text 
| 

| class 
| int 
| Class: 0 = All 

| deityid 
| int 
| Deity: 0 = Alll 

| zone_id_list 
| text 
| 

| itemid 
| int 
| Item Identifier 

| item_charges 
| tinyint 
| Item Charges 

| status 
| mediumint 
| 

| slot 
| mediumint 
| Slot 

| min_expansion 
| tinyint 
| Minimum Expansion 

| max_expansion 
| tinyint 
| Maximum Expansion 

| content_flags 
| varchar 
| Content Flags Required to be Enabled 

| content_flags_disabled 
| varchar 
| Content Flags Required to be Disabled

---

## variables

*Source: schema/admin/variables/index.html*

# variables¶

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| 

| varname 
| varchar 
| Variable Name 

| value 
| text 
| Value 

| information 
| text 
| Information 

| ts 
| timestamp 
| Timestamp

---

## veteran_reward_templates

*Source: schema/admin/veteran_reward_templates/index.html*

# veteran_reward_templates¶

## Relationships¶

```
erDiagram
 veteran_reward_templates {
 intunsigned claim_id
 intunsigned item_id
 }
 account_rewards {
 intunsigned account_id
 intunsigned reward_id
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 veteran_reward_templates ||--o{ account_rewards : "Has-Many"
 veteran_reward_templates ||--o{ items : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| claim_id 
| account_rewards 
| reward_id 

| One-to-One 
| item_id 
| items 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| claim_id 
| int 
| Unique Claim Identifier 

| name 
| varchar 
| Name 

| item_id 
| int 
| Item Identifier 

| charges 
| smallint 
| Charges 

| reward_slot 
| tinyint 
| Reward Slot

---

## adventure_details

*Source: schema/adventures/adventure_details/index.html*

# adventure_details¶

## Relationships¶

```
erDiagram
 adventure_details {
 intunsigned id
 smallintunsigned adventure_id
 int instance_id
 }
 adventure_members {
 intunsigned id
 intunsigned charid
 }
 adventure_template {
 intunsigned id
 intunsigned graveyard_zone_id
 varchar zone
 smallintunsigned zone_in_zone_id
 tinyintunsigned zone_version
 varchar version
 }
 adventure_template_entry {
 intunsigned id
 intunsigned template_id
 }
 adventure_template_entry_flavor {
 intunsigned id
 }
 instance_list {
 int id
 tinyintunsigned version
 intunsigned zone
 }
 adventure_details ||--o{ adventure_members : "Has-Many"
 adventure_details ||--o{ adventure_template : "One-to-One"
 adventure_details ||--o{ adventure_template_entry : "Has-Many"
 adventure_details ||--o{ adventure_template_entry_flavor : "Has-Many"
 adventure_details ||--o{ adventure_template : "One-to-One"
 adventure_details ||--o{ instance_list : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| id 
| adventure_members 
| id 

| One-to-One 
| id 
| adventure_template 
| id 

| Has-Many 
| id 
| adventure_template_entry 
| id 

| Has-Many 
| id 
| adventure_template_entry_flavor 
| id 

| One-to-One 
| adventure_id 
| adventure_template 
| id 

| One-to-One 
| instance_id 
| instance_list 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Entry Identifier 

| adventure_id 
| smallint 
| Unique Adventure Identifier 

| instance_id 
| int 
| Instance Identifier 

| count 
| smallint 
| Count 

| assassinate_count 
| smallint 
| Assassinate Count 

| status 
| tinyint 
| Status 

| time_created 
| int 
| Time Created UNIX Timestamp 

| time_zoned 
| int 
| Time Zoned UNIX Timestamp 

| time_completed 
| int 
| Time Completed UNIX Timestamp

---

## adventure_members

*Source: schema/adventures/adventure_members/index.html*

# adventure_members¶

## Relationships¶

```
erDiagram
 adventure_members {
 intunsigned id
 intunsigned charid
 }
 adventure_details {
 intunsigned id
 smallintunsigned adventure_id
 int instance_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 adventure_members ||--o{ adventure_details : "One-to-One"
 adventure_members ||--o{ character_data : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| id 
| adventure_details 
| id 

| One-to-One 
| charid 
| character_data 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Adventure Identifier 

| charid 
| int 
| Character Identifier

---

## adventure_stats

*Source: schema/adventures/adventure_stats/index.html*

# adventure_stats¶

## Relationships¶

```
erDiagram
 adventure_stats {
 intunsigned player_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 adventure_stats ||--o{ character_data : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| player_id 
| character_data 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| player_id 
| int 
| Character Identifier 

| guk_wins 
| mediumint 
| Deepest Guk Wins 

| mir_wins 
| mediumint 
| Miragul's Menagerie Wins 

| mmc_wins 
| mediumint 
| Mistmoore Catacombs Wins 

| ruj_wins 
| mediumint 
| Rujarkian Hills Wins 

| tak_wins 
| mediumint 
| Takish-Hiz Wins 

| guk_losses 
| mediumint 
| Deepest Guk Losses 

| mir_losses 
| mediumint 
| Miragul's Menagerie Losses 

| mmc_losses 
| mediumint 
| Mistmoore Catacombs Losses 

| ruj_losses 
| mediumint 
| Rujarkian Hills Losses 

| tak_losses 
| mediumint 
| Takish-Hiz Losses

---

## adventure_template

*Source: schema/adventures/adventure_template/index.html*

# adventure_template¶

## Relationships¶

```
erDiagram
 adventure_template {
 intunsigned id
 intunsigned graveyard_zone_id
 varchar zone
 smallintunsigned zone_in_zone_id
 tinyintunsigned zone_version
 varchar version
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 adventure_details {
 intunsigned id
 smallintunsigned adventure_id
 int instance_id
 }
 adventure_template ||--o{ zone : "One-to-One"
 adventure_template ||--o{ adventure_details : "One-to-One"
 adventure_template ||--o{ zone : "One-to-One"
 adventure_template ||--o{ zone : "One-to-One"
 adventure_template ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| graveyard_zone_id 
| zone 
| zoneidnumber 

| One-to-One 
| id 
| adventure_details 
| id 

| One-to-One 
| zone 
| zone 
| short_name 

| One-to-One 
| zone_in_zone_id 
| zone 
| zoneidnumber 

| One-to-One 
| zone_version 
| zone 
| version 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Adventure Identifier 

| zone 
| varchar 
| Zone Short Name 

| zone_version 
| tinyint 
| Zone Version 

| is_hard 
| tinyint 
| Hard: 0 = False, 1 = True 

| is_raid 
| tinyint 
| Raid: 0 = False, 1 = True 

| min_level 
| tinyint 
| Minimum Level 

| max_level 
| tinyint 
| Maximum Level 

| type 
| tinyint 
| Type 

| type_data 
| int 
| Type Data 

| type_count 
| smallint 
| Type Count 

| assa_x 
| float 
| Assassination X Coordinate 

| assa_y 
| float 
| Assassination Y Coordinate 

| assa_z 
| float 
| Assassination Z Coordinate 

| assa_h 
| float 
| Assassination Heading Coordinate 

| text 
| varchar 
| Text 

| duration 
| int 
| Duration 

| zone_in_time 
| int 
| Zone In Duration 

| win_points 
| smallint 
| LDoN Points for Winning 

| lose_points 
| smallint 
| LDoN Points for Losing 

| theme 
| tinyint 
| LDoN Theme 

| zone_in_zone_id 
| smallint 
| Zone In Zone Identifier 

| zone_in_x 
| float 
| Zone In X Coordinate 

| zone_in_y 
| float 
| Zone In Y Coordinate 

| zone_in_object_id 
| smallint 
| Zone In Object Identifier 

| dest_x 
| float 
| Destination X Coordinate 

| dest_y 
| float 
| Destination Y Coordinate 

| dest_z 
| float 
| Destination Z Coordinate 

| dest_h 
| float 
| Destination Heading Coordinate 

| graveyard_zone_id 
| int 
| Zone Identifier 

| graveyard_x 
| float 
| Graveyard X Coordinate 

| graveyard_y 
| float 
| Graveyard Y Coordinate 

| graveyard_z 
| float 
| Graveyard Z Coordinate 

| graveyard_radius 
| float 
| Graveyard Radius

---

## adventure_template_entry

*Source: schema/adventures/adventure_template_entry/index.html*

# adventure_template_entry¶

## Relationships¶

```
erDiagram
 adventure_template_entry {
 intunsigned id
 intunsigned template_id
 }
 adventure_details {
 intunsigned id
 smallintunsigned adventure_id
 int instance_id
 }
 adventure_template {
 intunsigned id
 intunsigned graveyard_zone_id
 varchar zone
 smallintunsigned zone_in_zone_id
 tinyintunsigned zone_version
 varchar version
 }
 adventure_template_entry ||--o{ adventure_details : "One-to-One"
 adventure_template_entry ||--o{ adventure_template : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| id 
| adventure_details 
| id 

| One-to-One 
| template_id 
| adventure_template 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Adventure Identifier 

| template_id 
| int 
| Template Identifier

---

## adventure_template_entry_flavor

*Source: schema/adventures/adventure_template_entry_flavor/index.html*

# adventure_template_entry_flavor¶

## Relationships¶

```
erDiagram
 adventure_template_entry_flavor {
 intunsigned id
 }
 adventure_details {
 intunsigned id
 smallintunsigned adventure_id
 int instance_id
 }
 adventure_template_entry_flavor ||--o{ adventure_details : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| id 
| adventure_details 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Adventure Identifier 

| text 
| varchar 
| Text

---

## alternate_currency

*Source: schema/alternate-currency/alternate_currency/index.html*

# alternate_currency¶

## Relationships¶

```
erDiagram
 alternate_currency {
 int id
 int item_id
 }
 character_alt_currency {
 intunsigned currency_id
 intunsigned char_id
 }
 npc_types {
 intunsigned alt_currency_id
 int id
 int npc_faction_id
 text name
 intunsigned loottable_id
 intunsigned merchant_id
 intunsigned emoteid
 intunsigned adventure_template_id
 intunsigned armortint_id
 intunsigned npc_spells_id
 intunsigned npc_spells_effects_id
 intunsigned trap_template
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 alternate_currency ||--o{ character_alt_currency : "Has-Many"
 alternate_currency ||--o{ npc_types : "Has-Many"
 alternate_currency ||--o{ items : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| id 
| character_alt_currency 
| currency_id 

| Has-Many 
| id 
| npc_types 
| alt_currency_id 

| Has-Many 
| item_id 
| items 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Alternate Currency Identifier 

| item_id 
| int 
| Item Identifier

---

## books

*Source: schema/books/books/index.html*

# books¶

## Relationships¶

```
erDiagram
 books {
 int id
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 books ||--o{ items : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| id 
| items 
| book 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Book Identifier 

| name 
| varchar 
| Unique Book Identifier 

| txtfile 
| text 
| The text in the book. ` Represents line spaces, `` is two line spaces, ``` is three line spaces, etc. (13 lines per book page) 

| language 
| int 
| Language

---

## bot_buffs

*Source: schema/bots/bot_buffs/index.html*

# bot_buffs¶

## Relationships¶

```
erDiagram
 bot_buffs {
 varchar bot_id
 varchar spell_id
 }
 bot_data {
 varchar bot_id
 varchar owner_id
 varchar spells_id
 varchar zone_id
 }
 spells_new {
 int id
 int descnum
 int effectdescnum
 int effectdescnum2
 int typedescnum
 varchar teleport_zone
 }
 bot_buffs ||--o{ bot_data : "One-to-One"
 bot_buffs ||--o{ spells_new : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| bot_id 
| bot_data 
| bot_id 

| One-to-One 
| spell_id 
| spells_new 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| buffs_index 
| int 
| Unique Entry Identifier 

| bot_id 
| int 
| Bot Identifier 

| spell_id 
| int 
| Spell Identifier 

| caster_level 
| tinyint 
| Caster level 

| duration_formula 
| int 
| Duration Formula 

| tics_remaining 
| int 
| Tics Remaining 

| poison_counters 
| int 
| Poison Counter 

| disease_counters 
| int 
| Disease Counter 

| curse_counters 
| int 
| Curse Counter 

| corruption_counters 
| int 
| Corruption Counter 

| numhits 
| int 
| Number of Hits 

| melee_rune 
| int 
| Melee Rune 

| magic_rune 
| int 
| Magic Rune 

| dot_rune 
| int 
| Damage Over Time Rune 

| persistent 
| tinyint 
| Persistent: 0 = False, 1 = True 

| caston_x 
| int 
| X Coordinate 

| caston_y 
| int 
| Y Coordinate 

| caston_z 
| int 
| Z Coordinate 

| extra_di_chance 
| int 
| Extra DI Chance 

| instrument_mod 
| int 
| Instrument Modifier

---

## bot_command_settings

*Source: schema/bots/bot_command_settings/index.html*

# bot_command_settings¶

## Schema¶

| 

Column 
| Data Type 
| Description 

| bot_command 
| varchar 
| Unique Bot Command Identifier 

| access 
| int 
| Required Status 

| aliases 
| varchar 
| Aliases

---

## bot_create_combinations

*Source: schema/bots/bot_create_combinations/index.html*

# bot_create_combinations¶

## Schema¶

| 

Column 
| Data Type 
| Description 

| race 
| int 
| Races Bitmask 

| classes 
| int 
| Classes Bitmask

---

## bot_data

*Source: schema/bots/bot_data/index.html*

# bot_data¶

## Relationships¶

```
erDiagram
 bot_data {
 varchar bot_id
 varchar owner_id
 varchar spells_id
 varchar zone_id
 }
 bot_guild_members {
 varchar bot_id
 varchar guild_id
 }
 bot_heal_rotation_members {
 varchar bot_id
 varchar heal_rotation_index
 }
 bot_inspect_messages {
 varchar bot_id
 }
 bot_inventories {
 varchar bot_id
 varchar item_id
 varchar augment_1
 varchar augment_2
 varchar augment_3
 varchar augment_4
 varchar augment_5
 varchar augment_6
 }
 bot_pets {
 varchar bot_id
 varchar pets_index
 varchar spell_id
 }
 bot_data ||--o{ bot_guild_members : "One-to-One"
 bot_data ||--o{ bot_heal_rotation_members : "Has-Many"
 bot_data ||--o{ bot_inspect_messages : "One-to-One"
 bot_data ||--o{ bot_inventories : "Has-Many"
 bot_data ||--o{ bot_pets : "One-to-One"

```

```
erDiagram
 bot_data {
 varchar bot_id
 varchar owner_id
 varchar spells_id
 varchar zone_id
 }
 bot_stances {
 varchar bot_id
 varchar stance_id
 }
 bot_timers {
 varchar bot_id
 varchar bot_data
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 npc_spells {
 intunsigned id
 intunsigned parent_list
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 bot_data ||--o{ bot_stances : "One-to-One"
 bot_data ||--o{ bot_timers : "Has-Many"
 bot_data ||--o{ character_data : "One-to-One"
 bot_data ||--o{ npc_spells : "One-to-One"
 bot_data ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| bot_id 
| bot_guild_members 
| bot_id 

| Has-Many 
| bot_id 
| bot_heal_rotation_members 
| bot_id 

| One-to-One 
| bot_id 
| bot_inspect_messages 
| bot_id 

| Has-Many 
| bot_id 
| bot_inventories 
| bot_id 

| One-to-One 
| bot_id 
| bot_pets 
| bot_id 

| One-to-One 
| bot_id 
| bot_stances 
| bot_id 

| Has-Many 
| bot_id 
| bot_timers 
| bot_id 

| One-to-One 
| owner_id 
| character_data 
| id 

| One-to-One 
| spells_id 
| npc_spells 
| id 

| One-to-One 
| zone_id 
| zone 
| zoneidnumber 

## Schema¶

| 

Column 
| Data Type 
| Description 

| bot_id 
| int 
| Unique Bot Identifier 

| owner_id 
| int 
| Owner Character Identifier 

| spells_id 
| int 
| Bot Spell List Identifier 

| name 
| varchar 
| Name 

| last_name 
| varchar 
| Last Name 

| title 
| varchar 
| Title 

| suffix 
| varchar 
| Suffix 

| zone_id 
| smallint 
| Zone Identifier 

| gender 
| tinyint 
| Gender 

| race 
| smallint 
| Race 

| class 
| tinyint 
| Class 

| level 
| tinyint 
| Level 

| deity 
| int 
| Deity 

| creation_day 
| int 
| UNIX Timestamp of creation date 

| last_spawn 
| int 
| UNIX Timestamp of last spawn_conditions 

| time_spawned 
| int 
| Time spawned 

| size 
| float 
| Size 

| face 
| int 
| Face 

| hair_color 
| int 
| Hair Color 

| hair_style 
| int 
| Hair Style 

| beard 
| int 
| Beard 

| beard_color 
| int 
| Beard Color 

| eye_color_1 
| int 
| Eye Color 1 

| eye_color_2 
| int 
| Eye Color 2 

| drakkin_heritage 
| int 
| Drakkin Heritage 

| drakkin_tattoo 
| int 
| Drakkin Tattoo 

| drakkin_details 
| int 
| Drakkin Details 

| ac 
| smallint 
| Armor Class 

| atk 
| mediumint 
| Attack 

| hp 
| int 
| Health 

| mana 
| int 
| Mana 

| str 
| mediumint 
| Strength 

| sta 
| mediumint 
| Stamina 

| cha 
| mediumint 
| Charisma 

| dex 
| mediumint 
| Dexterity 

| int 
| mediumint 
| Intelligence 

| agi 
| mediumint 
| Agility 

| wis 
| mediumint 
| Wisdom 

| fire 
| smallint 
| Fire Resistance 

| cold 
| smallint 
| Cold Resistance 

| magic 
| smallint 
| Magic Resistance 

| poison 
| smallint 
| Poison Resistance 

| disease 
| smallint 
| Disease Resistance 

| corruption 
| smallint 
| Corruption Resistance 

| show_helm 
| int 
| Show Helm: 0 = False, 1= True 

| follow_distance 
| int 
| Follow Distance 

| stop_melee_level 
| tinyint 
| Stop Melee Level 

| expansion_bitmask 
| int 
| Expansion Bitmask 

| enforce_spell_settings 
| tinyint 
| Enforce Spell Settings: 0 = False, 1 = True 

| archery_setting 
| tinyint 
| Archery Setting: 0 = False, 1 = True 

| caster_range 
| int 
| Caster Range

---

## bot_guild_members

*Source: schema/bots/bot_guild_members/index.html*

# bot_guild_members¶

## Relationships¶

```
erDiagram
 bot_guild_members {
 varchar bot_id
 varchar guild_id
 }
 bot_data {
 varchar bot_id
 varchar owner_id
 varchar spells_id
 varchar zone_id
 }
 guilds {
 int id
 int leader
 varchar motd_setter
 }
 bot_guild_members ||--o{ bot_data : "One-to-One"
 bot_guild_members ||--o{ guilds : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| bot_id 
| bot_data 
| bot_id 

| One-to-One 
| guild_id 
| guilds 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| bot_id 
| int 
| Bot Identifier 

| guild_id 
| mediumint 
| Guild Identifier 

| rank 
| tinyint 
| Guild Rank 

| tribute_enable 
| tinyint 
| Tribute Enabled: 0 = False, 1= True 

| total_tribute 
| int 
| Total Tribute 

| last_tribute 
| int 
| Last Tribute 

| banker 
| tinyint 
| Banker: 0 = False, 1 = True 

| public_note 
| text 
| Public Note 

| alt 
| tinyint 
| Alt: 0 = False, 1 = True

---

## bot_heal_rotation_members

*Source: schema/bots/bot_heal_rotation_members/index.html*

# bot_heal_rotation_members¶

## Relationships¶

```
erDiagram
 bot_heal_rotation_members {
 varchar bot_id
 varchar heal_rotation_index
 }
 bot_data {
 varchar bot_id
 varchar owner_id
 varchar spells_id
 varchar zone_id
 }
 bot_heal_rotations {
 varchar heal_rotation_index
 varchar bot_id
 }
 bot_heal_rotation_members ||--o{ bot_data : "One-to-One"
 bot_heal_rotation_members ||--o{ bot_heal_rotations : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| bot_id 
| bot_data 
| bot_id 

| One-to-One 
| heal_rotation_index 
| bot_heal_rotations 
| heal_rotation_index 

## Schema¶

| 

Column 
| Data Type 
| Description 

| member_index 
| int 
| Unique Bot Heal Rotation Member Identifier 

| heal_rotation_index 
| int 
| Heal Rotation Identifier 

| bot_id 
| int 
| Bot Identifier

---

## bot_heal_rotation_targets

*Source: schema/bots/bot_heal_rotation_targets/index.html*

# bot_heal_rotation_targets¶

## Relationships¶

```
erDiagram
 bot_heal_rotation_targets {
 varchar heal_rotation_index
 }
 bot_heal_rotations {
 varchar heal_rotation_index
 varchar bot_id
 }
 bot_heal_rotation_targets ||--o{ bot_heal_rotations : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| heal_rotation_index 
| bot_heal_rotations 
| heal_rotation_index 

## Schema¶

| 

Column 
| Data Type 
| Description 

| target_index 
| int 
| Unique Bot Heal Rotation Target Identifier 

| heal_rotation_index 
| int 
| Heal Rotation Identifier 

| target_name 
| varchar 
| Target Name

---

## bot_heal_rotations

*Source: schema/bots/bot_heal_rotations/index.html*

# bot_heal_rotations¶

## Relationships¶

```
erDiagram
 bot_heal_rotations {
 varchar heal_rotation_index
 varchar bot_id
 }
 bot_data {
 varchar bot_id
 varchar owner_id
 varchar spells_id
 varchar zone_id
 }
 bot_heal_rotation_members {
 varchar bot_id
 varchar heal_rotation_index
 }
 bot_heal_rotation_targets {
 varchar heal_rotation_index
 }
 bot_heal_rotations ||--o{ bot_data : "One-to-One"
 bot_heal_rotations ||--o{ bot_heal_rotation_members : "Has-Many"
 bot_heal_rotations ||--o{ bot_heal_rotation_targets : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| bot_id 
| bot_data 
| bot_id 

| Has-Many 
| heal_rotation_index 
| bot_heal_rotation_members 
| heal_rotation_index 

| Has-Many 
| heal_rotation_index 
| bot_heal_rotation_targets 
| heal_rotation_index 

## Schema¶

| 

Column 
| Data Type 
| Description 

| heal_rotation_index 
| int 
| Unique Heal Rotation Identifier 

| bot_id 
| int 
| Bot Identifier 

| interval 
| int 
| Interval 

| fast_heals 
| int 
| Fast Heals 

| adaptive_targeting 
| int 
| Adaptive Targeting 

| casting_override 
| int 
| Casting Override 

| safe_hp_base 
| float 
| Safe Health Base 

| safe_hp_cloth 
| float 
| Safe Health Cloth 

| safe_hp_leather 
| float 
| Safe Health Leather 

| safe_hp_chain 
| float 
| Safe Health Chain 

| safe_hp_plate 
| float 
| Safe Health Plate 

| critical_hp_base 
| float 
| Critical Health Base 

| critical_hp_cloth 
| float 
| Critical Health Cloth 

| critical_hp_leather 
| float 
| Critical Health Leather 

| critical_hp_chain 
| float 
| Critical Health Chain 

| critical_hp_plate 
| float 
| Critical Health Plate

---

## bot_inspect_messages

*Source: schema/bots/bot_inspect_messages/index.html*

# bot_inspect_messages¶

## Relationships¶

```
erDiagram
 bot_inspect_messages {
 varchar bot_id
 }
 bot_data {
 varchar bot_id
 varchar owner_id
 varchar spells_id
 varchar zone_id
 }
 bot_inspect_messages ||--o{ bot_data : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| bot_id 
| bot_data 
| bot_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| bot_id 
| int 
| Bot Identifier 

| inspect_message 
| varchar 
| Inspect Message

---

## bot_inventories

*Source: schema/bots/bot_inventories/index.html*

# bot_inventories¶

## Relationships¶

```
erDiagram
 bot_inventories {
 varchar bot_id
 varchar item_id
 varchar augment_1
 varchar augment_2
 varchar augment_3
 varchar augment_4
 varchar augment_5
 varchar augment_6
 }
 bot_data {
 varchar bot_id
 varchar owner_id
 varchar spells_id
 varchar zone_id
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 bot_inventories ||--o{ bot_data : "One-to-One"
 bot_inventories ||--o{ items : "One-to-One"
 bot_inventories ||--o{ items : "One-to-One"
 bot_inventories ||--o{ items : "One-to-One"
 bot_inventories ||--o{ items : "One-to-One"
 bot_inventories ||--o{ items : "One-to-One"
 bot_inventories ||--o{ items : "One-to-One"
 bot_inventories ||--o{ items : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| bot_id 
| bot_data 
| bot_id 

| One-to-One 
| item_id 
| items 
| id 

| One-to-One 
| augment_1 
| items 
| id 

| One-to-One 
| augment_2 
| items 
| id 

| One-to-One 
| augment_3 
| items 
| id 

| One-to-One 
| augment_4 
| items 
| id 

| One-to-One 
| augment_5 
| items 
| id 

| One-to-One 
| augment_6 
| items 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| inventories_index 
| int 
| Unique Bot Inventory Identifier 

| bot_id 
| int 
| Bot Identifier 

| slot_id 
| mediumint 
| Slot Identifier 

| item_id 
| int 
| Item Identifier 

| inst_charges 
| smallint 
| Charges 

| inst_color 
| int 
| Color 

| inst_no_drop 
| tinyint 
| No Drop: 0 = False, 1= True 

| inst_custom_data 
| text 
| Custom Data 

| ornament_icon 
| int 
| Ornamentation Icon 

| ornament_id_file 
| int 
| Ornamentation Item Texture 

| ornament_hero_model 
| int 
| Ornamentation Hero's Forge Model 

| augment_1 
| mediumint 
| Augment Slot 1 

| augment_2 
| mediumint 
| Augment Slot 2 

| augment_3 
| mediumint 
| Augment Slot 3 

| augment_4 
| mediumint 
| Augment Slot 4 

| augment_5 
| mediumint 
| Augment Slot 5 

| augment_6 
| mediumint 
| Augment Slot 6

---

## bot_owner_options

*Source: schema/bots/bot_owner_options/index.html*

# bot_owner_options¶

## Relationships¶

```
erDiagram
 bot_owner_options {
 varchar owner_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 bot_owner_options ||--o{ character_data : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| owner_id 
| character_data 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| owner_id 
| int 
| Owner Character Identifier 

| option_type 
| smallint 
| Option Type 

| option_value 
| smallint 
| Option Value

---

## bot_pet_buffs

*Source: schema/bots/bot_pet_buffs/index.html*

# bot_pet_buffs¶

## Relationships¶

```
erDiagram
 bot_pet_buffs {
 varchar pets_index
 varchar spell_id
 }
 bot_pets {
 varchar bot_id
 varchar pets_index
 varchar spell_id
 }
 spells_new {
 int id
 int descnum
 int effectdescnum
 int effectdescnum2
 int typedescnum
 varchar teleport_zone
 }
 bot_pet_buffs ||--o{ bot_pets : "One-to-One"
 bot_pet_buffs ||--o{ spells_new : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| pets_index 
| bot_pets 
| pets_index 

| One-to-One 
| spell_id 
| spells_new 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| pet_buffs_index 
| int 
| Unique Bot Pet Buffs Identifier 

| pets_index 
| int 
| Bot Pet Identifier 

| spell_id 
| int 
| Spell Identifier 

| caster_level 
| int 
| Caster Level 

| duration 
| int 
| Duration of buff

---

## bot_pet_inventories

*Source: schema/bots/bot_pet_inventories/index.html*

# bot_pet_inventories¶

## Relationships¶

```
erDiagram
 bot_pet_inventories {
 varchar pets_index
 varchar item_id
 }
 bot_pets {
 varchar bot_id
 varchar pets_index
 varchar spell_id
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 bot_pet_inventories ||--o{ bot_pets : "One-to-One"
 bot_pet_inventories ||--o{ items : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| pets_index 
| bot_pets 
| pets_index 

| One-to-One 
| item_id 
| items 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| pet_inventories_index 
| int 
| Unique Bot Pet Inventory Identifier 

| pets_index 
| int 
| Bot Pet Identifier 

| item_id 
| int 
| Item Identifier

---

## bot_pets

*Source: schema/bots/bot_pets/index.html*

# bot_pets¶

## Relationships¶

```
erDiagram
 bot_pets {
 varchar bot_id
 varchar pets_index
 varchar spell_id
 }
 bot_data {
 varchar bot_id
 varchar owner_id
 varchar spells_id
 varchar zone_id
 }
 bot_pet_buffs {
 varchar pets_index
 varchar spell_id
 }
 bot_pet_inventories {
 varchar pets_index
 varchar item_id
 }
 spells_new {
 int id
 int descnum
 int effectdescnum
 int effectdescnum2
 int typedescnum
 varchar teleport_zone
 }
 bot_pets ||--o{ bot_data : "One-to-One"
 bot_pets ||--o{ bot_pet_buffs : "Has-Many"
 bot_pets ||--o{ bot_pet_inventories : "Has-Many"
 bot_pets ||--o{ spells_new : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| bot_id 
| bot_data 
| bot_id 

| Has-Many 
| pets_index 
| bot_pet_buffs 
| pets_index 

| Has-Many 
| pets_index 
| bot_pet_inventories 
| pets_index 

| One-to-One 
| spell_id 
| spells_new 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| pets_index 
| int 
| Unique Bot Pet Identifier 

| spell_id 
| int 
| Spell Identifier 

| bot_id 
| int 
| Bot Identifier 

| name 
| varchar 
| Name 

| mana 
| int 
| Mana 

| hp 
| int 
| Health

---

## bot_spell_casting_chances

*Source: schema/bots/bot_spell_casting_chances/index.html*

# bot_spell_casting_chances¶

## Relationships¶

```
erDiagram
 bot_spell_casting_chances {
 varchar spell_type_index
 varchar stance_index
 }
 bot_spells_entries {
 varchar type
 varchar npc_spells_id
 varchar spell_id
 varchar spellid
 }
 bot_spell_casting_chances ||--o{ bot_spells_entries : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| spell_type_index 
| bot_spells_entries 
| type 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Bot Spell Casting Chance Identifier 

| spell_type_index 
| tinyint 
| Spell Type Identifier 

| class_id 
| tinyint 
| Class Identifier 

| stance_index 
| tinyint 
| Stance Type Identifier 

| nHSND_value 
| tinyint 
| Negative Healer/Slower/Nuker/Doter Value 

| pH_value 
| tinyint 
| Positive Healer Value 

| pS_value 
| tinyint 
| Positive Slower Value 

| pHS_value 
| tinyint 
| Positive Healer/Slower Value 

| pN_value 
| tinyint 
| Positive Nuker Value 

| pHN_value 
| tinyint 
| Positive Healer/Nuker Value 

| pSN_value 
| tinyint 
| Positive Slower/Nuker Value 

| pHSN_value 
| tinyint 
| Positive Healer/Slower/Nuker Value 

| pD_value 
| tinyint 
| Positive Doter Value 

| pHD_value 
| tinyint 
| Positive Healer/Doter Value 

| pSD_value 
| tinyint 
| Positive Slower/Doter Value 

| pHSD_value 
| tinyint 
| Positive Healer/Slower/Doter Value 

| pND_value 
| tinyint 
| Positive Nuker/Doter Value 

| pHND_value 
| tinyint 
| Positive Healer/Nuker/Doter Value 

| pSND_value 
| tinyint 
| Positive Slower/Nuker/Doter Value 

| pHSND_value 
| tinyint 
| Positive Healer/Slower/Nuker/Doter Value

---

## bot_spell_settings

*Source: schema/bots/bot_spell_settings/index.html*

# bot_spell_settings¶

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Bot Spell Setting Identifier 

| bot_id 
| int 
| Bot Identifier 

| spell_id 
| smallint 
| Spell Identifier 

| priority 
| smallint 
| Priority 

| min_hp 
| smallint 
| Minimum Health Percentage 

| max_hp 
| smallint 
| Maximum Health Percentage 

| is_enabled 
| tinyint 
| Is Enabled: 0 = False, 1 = True

---

## bot_spells_entries

*Source: schema/bots/bot_spells_entries/index.html*

# bot_spells_entries¶

## Relationships¶

```
erDiagram
 bot_spells_entries {
 varchar type
 varchar npc_spells_id
 varchar spell_id
 varchar spellid
 }
 npc_spells {
 intunsigned id
 intunsigned parent_list
 }
 spells_new {
 int id
 int descnum
 int effectdescnum
 int effectdescnum2
 int typedescnum
 varchar teleport_zone
 }
 bot_spells_entries ||--o{ npc_spells : "One-to-One"
 bot_spells_entries ||--o{ spells_new : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| npc_spells_id 
| npc_spells 
| id 

| One-to-One 
| spell_id 
| spells_new 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Bot Spell Entry Identifier 

| npc_spells_id 
| int 
| Bot Spell List Identifier 

| spellid 
| smallint 
| Spell Identifier 

| type 
| int 
| Spell Type 

| minlevel 
| tinyint 
| Minimum Level 

| maxlevel 
| tinyint 
| Maximum Level 

| manacost 
| smallint 
| Mana Cost 

| recast_delay 
| int 
| Recast Delay 

| priority 
| smallint 
| Bot Spell Priority: Lower is better 

| resist_adjust 
| int 
| Resist Adjustment 

| min_hp 
| smallint 
| Minimum Health Percentage 

| max_hp 
| smallint 
| Maximum Health Percentage 

| bucket_name 
| varchar 
| Bucket Name 

| bucket_value 
| varchar 
| Bucket Value 

| bucket_comparison 
| tinyint 
| Bucket Comparison

---

## bot_stances

*Source: schema/bots/bot_stances/index.html*

# bot_stances¶

## Relationships¶

```
erDiagram
 bot_stances {
 varchar bot_id
 varchar stance_id
 }
 bot_data {
 varchar bot_id
 varchar owner_id
 varchar spells_id
 varchar zone_id
 }
 bot_spell_casting_chances {
 varchar spell_type_index
 varchar stance_index
 }
 bot_stances ||--o{ bot_data : "One-to-One"
 bot_stances ||--o{ bot_spell_casting_chances : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| bot_id 
| bot_data 
| bot_id 

| Has-Many 
| stance_id 
| bot_spell_casting_chances 
| stance_index 

## Schema¶

| 

Column 
| Data Type 
| Description 

| bot_id 
| int 
| Bot Identifier 

| stance_id 
| tinyint 
| Stance Identifier

---

## bot_timers

*Source: schema/bots/bot_timers/index.html*

# bot_timers¶

## Relationships¶

```
erDiagram
 bot_timers {
 varchar bot_id
 varchar bot_data
 }
 bot_data {
 varchar bot_id
 varchar owner_id
 varchar spells_id
 varchar zone_id
 }
 bot_timers ||--o{ bot_data : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| bot_data 
| bot_data 
| bot_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| bot_id 
| int 
| Unique Bot Identifier 

| timer_id 
| int 
| Timer Identifier 

| timer_value 
| int 
| Timer Expiration

---

## buyer

*Source: schema/buyers/buyer/index.html*

# buyer¶

## Relationships¶

```
erDiagram
 buyer {
 int charid
 int itemid
 varchar itemname
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 buyer ||--o{ character_data : "One-to-One"
 buyer ||--o{ items : "One-to-One"
 buyer ||--o{ items : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| charid 
| character_data 
| id 

| One-to-One 
| itemid 
| items 
| id 

| One-to-One 
| itemname 
| items 
| name 

## Schema¶

| 

Column 
| Data Type 
| Description 

| charid 
| int 
| Character Identifier 

| buyslot 
| int 
| Slot 

| itemid 
| int 
| Item Identifier 

| itemname 
| varchar 
| Item Name 

| quantity 
| int 
| Quantity 

| price 
| int 
| Price

---

## char_create_combinations

*Source: schema/characters/char_create_combinations/index.html*

# char_create_combinations¶

## Relationships¶

```
erDiagram
 char_create_combinations {
 intunsigned allocation_id
 intunsigned start_zone
 }
 char_create_point_allocations {
 intunsigned id
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 char_create_combinations ||--o{ char_create_point_allocations : "One-to-One"
 char_create_combinations ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| allocation_id 
| char_create_point_allocations 
| id 

| One-to-One 
| start_zone 
| zone 
| zoneidnumber 

## Schema¶

| 

Column 
| Data Type 
| Description 

| allocation_id 
| int 
| Allocation Identifier 

| race 
| int 
| Race 

| class 
| int 
| Class 

| deity 
| int 
| Deity 

| start_zone 
| int 
| Start Zone Identifier 

| expansions_req 
| int 
| Expansions Required

---

## char_create_point_allocations

*Source: schema/characters/char_create_point_allocations/index.html*

# char_create_point_allocations¶

## Relationships¶

```
erDiagram
 char_create_point_allocations {
 intunsigned id
 }
 char_create_combinations {
 intunsigned allocation_id
 intunsigned start_zone
 }
 char_create_point_allocations ||--o{ char_create_combinations : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| id 
| char_create_combinations 
| allocation_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Allocation Identifier 

| base_str 
| int 
| Base Strength 

| base_sta 
| int 
| Base Stamina 

| base_dex 
| int 
| Base Dexterity 

| base_agi 
| int 
| Base Agility 

| base_int 
| int 
| Base Intelligence 

| base_wis 
| int 
| Base Wisdom 

| base_cha 
| int 
| Base Charisma 

| alloc_str 
| int 
| Allocated Strength 

| alloc_sta 
| int 
| Allocated Stamina 

| alloc_dex 
| int 
| Allocated Dexterity 

| alloc_agi 
| int 
| Allocated Agility 

| alloc_int 
| int 
| Allocated Intelligence 

| alloc_wis 
| int 
| Allocated Wisdom 

| alloc_cha 
| int 
| Allocated Charisma

---

## char_recipe_list

*Source: schema/characters/char_recipe_list/index.html*

# char_recipe_list¶

## Relationships¶

```
erDiagram
 char_recipe_list {
 int char_id
 int recipe_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 tradeskill_recipe {
 int id
 varchar content_flags
 varchar content_flags_disabled
 }
 char_recipe_list ||--o{ character_data : "One-to-One"
 char_recipe_list ||--o{ tradeskill_recipe : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| char_id 
| character_data 
| id 

| One-to-One 
| recipe_id 
| tradeskill_recipe 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| char_id 
| int 
| Character Identifier 

| recipe_id 
| int 
| Recipe Identifier 

| madecount 
| int 
| Made Count

---

## character_activities

*Source: schema/characters/character_activities/index.html*

# character_activities¶

## Relationships¶

```
erDiagram
 character_activities {
 intunsigned charid
 intunsigned taskid
 intunsigned activityid
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 tasks {
 intunsigned id
 tinyint type
 intunsigned dz_template_id
 }
 task_activities {
 intunsigned activityid
 varchar goalid
 varchar delivertonpc
 intunsigned taskid
 varchar zones
 }
 character_activities ||--o{ character_data : "One-to-One"
 character_activities ||--o{ tasks : "One-to-One"
 character_activities ||--o{ task_activities : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| charid 
| character_data 
| id 

| One-to-One 
| taskid 
| tasks 
| id 

| Has-Many 
| activityid 
| task_activities 
| activityid 

## Schema¶

| 

Column 
| Data Type 
| Description 

| charid 
| int 
| Character Identifier 

| taskid 
| int 
| Task Identifier 

| activityid 
| int 
| Activity Identifier 

| donecount 
| int 
| Done Count 

| completed 
| tinyint 
| Completed: 0 = False, 1 = True

---

## character_alt_currency

*Source: schema/characters/character_alt_currency/index.html*

# character_alt_currency¶

## Relationships¶

```
erDiagram
 character_alt_currency {
 intunsigned currency_id
 intunsigned char_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 alternate_currency {
 int id
 int item_id
 }
 character_alt_currency ||--o{ character_data : "One-to-One"
 character_alt_currency ||--o{ alternate_currency : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| char_id 
| character_data 
| id 

| One-to-One 
| currency_id 
| alternate_currency 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| char_id 
| int 
| Character Identifier 

| currency_id 
| int 
| Currency Identifier 

| amount 
| int 
| Amount

---

## character_alternate_abilities

*Source: schema/characters/character_alternate_abilities/index.html*

# character_alternate_abilities¶

## Relationships¶

```
erDiagram
 character_alternate_abilities {
 smallintunsigned aa_id
 intunsigned id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 aa_ranks {
 intunsigned id
 }
 character_alternate_abilities ||--o{ character_data : "One-to-One"
 character_alternate_abilities ||--o{ aa_ranks : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| id 
| character_data 
| id 

| One-to-One 
| aa_id 
| aa_ranks 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Character Identifier 

| aa_id 
| smallint 
| AA Identifier 

| aa_value 
| smallint 
| AA Value 

| charges 
| smallint 
| Charges

---

## character_auras

*Source: schema/characters/character_auras/index.html*

# character_auras¶

## Relationships¶

```
erDiagram
 character_auras {
 int id
 int spell_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 spells_new {
 int id
 int descnum
 int effectdescnum
 int effectdescnum2
 int typedescnum
 varchar teleport_zone
 }
 character_auras ||--o{ character_data : "One-to-One"
 character_auras ||--o{ spells_new : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| id 
| character_data 
| id 

| One-to-One 
| spell_id 
| spells_new 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Character Identifier 

| slot 
| tinyint 
| Slot 

| spell_id 
| int 
| Spell Identifier

---

## character_bandolier

*Source: schema/characters/character_bandolier/index.html*

# character_bandolier¶

## Relationships¶

```
erDiagram
 character_bandolier {
 intunsigned id
 intunsigned item_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 character_bandolier ||--o{ character_data : "One-to-One"
 character_bandolier ||--o{ items : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| id 
| character_data 
| id 

| One-to-One 
| item_id 
| items 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Character Identifier 

| bandolier_id 
| tinyint 
| Bandolier Identifier 

| bandolier_slot 
| tinyint 
| Slot 

| item_id 
| int 
| Item Identifier 

| icon 
| int 
| Icon 

| bandolier_name 
| varchar 
| Name

---

## character_bind

*Source: schema/characters/character_bind/index.html*

# character_bind¶

## Relationships¶

```
erDiagram
 character_bind {
 intunsigned id
 smallintunsigned zone_id
 mediumintunsigned instance_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 instance_list {
 int id
 tinyintunsigned version
 intunsigned zone
 }
 character_bind ||--o{ character_data : "One-to-One"
 character_bind ||--o{ zone : "One-to-One"
 character_bind ||--o{ instance_list : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| id 
| character_data 
| id 

| One-to-One 
| zone_id 
| zone 
| zoneidnumber 

| One-to-One 
| instance_id 
| instance_list 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Character Identifier 

| slot 
| int 
| Slot 

| zone_id 
| smallint 
| Zone Identifier 

| instance_id 
| mediumint 
| Instance Identifier 

| x 
| float 
| X Coordinate 

| y 
| float 
| Y Coordinate 

| z 
| float 
| Z Coordinate 

| heading 
| float 
| Heading Coordinate

---

## character_buffs

*Source: schema/characters/character_buffs/index.html*

# character_buffs¶

## Relationships¶

```
erDiagram
 character_buffs {
 intunsigned character_id
 smallintunsigned spell_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 spells_new {
 int id
 int descnum
 int effectdescnum
 int effectdescnum2
 int typedescnum
 varchar teleport_zone
 }
 character_buffs ||--o{ character_data : "One-to-One"
 character_buffs ||--o{ spells_new : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| character_id 
| character_data 
| id 

| One-to-One 
| spell_id 
| spells_new 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| character_id 
| int 
| Character Identifier 

| slot_id 
| tinyint 
| Buff Slot 

| spell_id 
| smallint 
| Buff Spell Identifier 

| caster_level 
| tinyint 
| Caster Level 

| caster_name 
| varchar 
| Caster Name 

| ticsremaining 
| int 
| Tics Remaining 

| counters 
| int 
| Counters 

| numhits 
| int 
| Number of Hits 

| melee_rune 
| int 
| Melee Rune 

| magic_rune 
| int 
| Magic Rune 

| persistent 
| tinyint 
| Persistent: 0 = False, 1 = True 

| dot_rune 
| int 
| Damage Over Time Rune 

| caston_x 
| int 
| X Coordinate 

| caston_y 
| int 
| Y Coordinate 

| caston_z 
| int 
| Z Coordinate 

| ExtraDIChance 
| int 
| Extra DI Chance 

| instrument_mod 
| int 
| Instrument Modifier

---

## character_corpse_items

*Source: schema/characters/character_corpse_items/index.html*

# character_corpse_items¶

## Relationships¶

```
erDiagram
 character_corpse_items {
 intunsigned corpse_id
 intunsigned item_id
 intunsigned aug_1
 intunsigned aug_2
 intunsigned aug_3
 intunsigned aug_4
 intunsigned aug_5
 int aug_6
 }
 character_corpses {
 intunsigned id
 intunsigned charid
 varchar charname
 smallintunsigned instance_id
 smallint zone_id
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 character_corpse_items ||--o{ character_corpses : "One-to-One"
 character_corpse_items ||--o{ items : "One-to-One"
 character_corpse_items ||--o{ items : "One-to-One"
 character_corpse_items ||--o{ items : "One-to-One"
 character_corpse_items ||--o{ items : "One-to-One"
 character_corpse_items ||--o{ items : "One-to-One"
 character_corpse_items ||--o{ items : "One-to-One"
 character_corpse_items ||--o{ items : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| corpse_id 
| character_corpses 
| id 

| One-to-One 
| item_id 
| items 
| id 

| One-to-One 
| aug_1 
| items 
| id 

| One-to-One 
| aug_2 
| items 
| id 

| One-to-One 
| aug_3 
| items 
| id 

| One-to-One 
| aug_4 
| items 
| id 

| One-to-One 
| aug_5 
| items 
| id 

| One-to-One 
| aug_6 
| items 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| corpse_id 
| int 
| Corpse Identifier 

| equip_slot 
| int 
| Equipment Slot 

| item_id 
| int 
| Item Identifier 

| charges 
| int 
| Item Charges 

| aug_1 
| int 
| Item Augment Slot 1 

| aug_2 
| int 
| Item Augment Slot 2 

| aug_3 
| int 
| Item Augment Slot 3 

| aug_4 
| int 
| Item Augment Slot 4 

| aug_5 
| int 
| Item Augment Slot 5 

| aug_6 
| int 
| Item Augment Slot 6 

| attuned 
| smallint 
| Item Attuned: 0 = False, 1 = True 

| custom_data 
| text 
| Custom Data 

| ornamenticon 
| int 
| Ornamentation Icon 

| ornamentidfile 
| int 
| Ornamentation IDFile 

| ornament_hero_model 
| int 
| Ornamentation Hero's Forge Model

---

## character_corpses

*Source: schema/characters/character_corpses/index.html*

# character_corpses¶

## Relationships¶

```
erDiagram
 character_corpses {
 intunsigned id
 intunsigned charid
 varchar charname
 smallintunsigned instance_id
 smallint zone_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 character_corpse_items {
 intunsigned corpse_id
 intunsigned item_id
 intunsigned aug_1
 intunsigned aug_2
 intunsigned aug_3
 intunsigned aug_4
 intunsigned aug_5
 int aug_6
 }
 instance_list {
 int id
 tinyintunsigned version
 intunsigned zone
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 character_corpses ||--o{ character_data : "One-to-One"
 character_corpses ||--o{ character_data : "One-to-One"
 character_corpses ||--o{ character_corpse_items : "Has-Many"
 character_corpses ||--o{ instance_list : "One-to-One"
 character_corpses ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| charid 
| character_data 
| id 

| One-to-One 
| charname 
| character_data 
| name 

| Has-Many 
| id 
| character_corpse_items 
| corpse_id 

| One-to-One 
| instance_id 
| instance_list 
| id 

| One-to-One 
| zone_id 
| zone 
| zoneidnumber 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Corpse Identifier 

| charid 
| int 
| Character Identifier 

| charname 
| varchar 
| Character Name 

| zone_id 
| smallint 
| Zone Identifier 

| instance_id 
| smallint 
| Instance Identifier 

| x 
| float 
| X Coordinate 

| y 
| float 
| Y Coordinate 

| z 
| float 
| Z Coordinate 

| heading 
| float 
| Heading Coordinate 

| time_of_death 
| datetime 
| Time of Death 

| guild_consent_id 
| int 
| Guild Consent Identifier 

| is_rezzed 
| tinyint 
| Is Rezzed: 0 = False, 1 = True 

| is_buried 
| tinyint 
| Is Buried: 0 = False, 1 = True 

| was_at_graveyard 
| tinyint 
| Was At Graveyard: 0 = False, 1 = True 

| is_locked 
| tinyint 
| Is Locked: 0 = False, 1 = True 

| exp 
| int 
| Experience 

| size 
| int 
| Size 

| level 
| int 
| Level 

| race 
| int 
| Race 

| gender 
| int 
| Gender 

| class 
| int 
| Class 

| deity 
| int 
| Deity 

| texture 
| int 
| Texture 

| helm_texture 
| int 
| Helm Texture 

| copper 
| int 
| Copper 

| silver 
| int 
| Silver 

| gold 
| int 
| Gold 

| platinum 
| int 
| Platinum 

| hair_color 
| int 
| Hair Color 

| beard_color 
| int 
| Beard Color 

| eye_color_1 
| int 
| Eye Color 1 

| eye_color_2 
| int 
| Eye Color 2 

| hair_style 
| int 
| Hair Style 

| face 
| int 
| Face 

| beard 
| int 
| Beard 

| drakkin_heritage 
| int 
| Drakkin Heritage 

| drakkin_tattoo 
| int 
| Drakkin Tattoo 

| drakkin_details 
| int 
| Drakkin Details 

| wc_1 
| int 
| Wear Change 1 

| wc_2 
| int 
| Wear Change 2 

| wc_3 
| int 
| Wear Change 3 

| wc_4 
| int 
| Wear Change 4 

| wc_5 
| int 
| Wear Change 5 

| wc_6 
| int 
| Wear Change 6 

| wc_7 
| int 
| Wear Change 7 

| wc_8 
| int 
| Wear Change 8 

| wc_9 
| int 
| Wear Change 9 

| rez_time 
| int 
| 

| gm_exp 
| int 
| 

| killed_by 
| int 
| 

| rezzable 
| tinyint 
|

---

## character_currency

*Source: schema/characters/character_currency/index.html*

# character_currency¶

## Relationships¶

```
erDiagram
 character_currency {
 intunsigned id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 character_currency ||--o{ character_data : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| id 
| character_data 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Character Identifier 

| platinum 
| int 
| Platinum 

| gold 
| int 
| Gold 

| silver 
| int 
| Silver 

| copper 
| int 
| Copper 

| platinum_bank 
| int 
| Banked Platinum 

| gold_bank 
| int 
| Banked Gold 

| silver_bank 
| int 
| Banked Silver 

| copper_bank 
| int 
| Banked Copper 

| platinum_cursor 
| int 
| Cursor Platinum 

| gold_cursor 
| int 
| Cursor Gold 

| silver_cursor 
| int 
| Cursor Silver 

| copper_cursor 
| int 
| Cursor Copper 

| radiant_crystals 
| int 
| Radiant Crystals 

| career_radiant_crystals 
| int 
| Career Radiant Crystals 

| ebon_crystals 
| int 
| Ebon Crystals 

| career_ebon_crystals 
| int 
| Career Ebon Crystals

---

## character_data

*Source: schema/characters/character_data/index.html*

# character_data¶

## Relationships¶

```
erDiagram
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 adventure_members {
 intunsigned id
 intunsigned charid
 }
 adventure_stats {
 intunsigned player_id
 }
 char_recipe_list {
 int char_id
 int recipe_id
 }
 character_pet_buffs {
 int char_id
 int spell_id
 }
 character_pet_info {
 int char_id
 int spell_id
 }
 character_data ||--o{ adventure_members : "Has-Many"
 character_data ||--o{ adventure_stats : "Has-Many"
 character_data ||--o{ char_recipe_list : "Has-Many"
 character_data ||--o{ character_pet_buffs : "Has-Many"
 character_data ||--o{ character_pet_info : "Has-Many"
 character_data ||--o{ character_pet_buffs : "Has-Many"
 character_data ||--o{ character_pet_info : "Has-Many"

```

```
erDiagram
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 character_pet_inventory {
 int char_id
 int item_id
 }
 faction_values {
 int char_id
 int faction_id
 }
 guild_members {
 int char_id
 mediumintunsigned guild_id
 }
 keyring {
 int char_id
 int item_id
 }
 player_titlesets {
 intunsigned char_id
 intunsigned title_set
 }
 character_data ||--o{ character_pet_inventory : "Has-Many"
 character_data ||--o{ faction_values : "Has-Many"
 character_data ||--o{ guild_members : "Has-Many"
 character_data ||--o{ keyring : "Has-Many"
 character_data ||--o{ player_titlesets : "Has-Many"
 character_data ||--o{ character_pet_inventory : "Has-Many"
 character_data ||--o{ faction_values : "Has-Many"
 character_data ||--o{ guild_members : "One-to-One"
 character_data ||--o{ keyring : "Has-Many"
 character_data ||--o{ player_titlesets : "Has-Many"

```

```
erDiagram
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 buyer {
 int charid
 int itemid
 varchar itemname
 }
 character_activities {
 intunsigned charid
 intunsigned taskid
 intunsigned activityid
 }
 character_alt_currency {
 intunsigned currency_id
 intunsigned char_id
 }
 character_alternate_abilities {
 smallintunsigned aa_id
 intunsigned id
 }
 character_auras {
 int id
 int spell_id
 }
 character_data ||--o{ buyer : "Has-Many"
 character_data ||--o{ character_activities : "Has-Many"
 character_data ||--o{ character_alt_currency : "Has-Many"
 character_data ||--o{ character_alternate_abilities : "Has-Many"
 character_data ||--o{ character_auras : "Has-Many"

```

```
erDiagram
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 character_bandolier {
 intunsigned id
 intunsigned item_id
 }
 character_bind {
 intunsigned id
 smallintunsigned zone_id
 mediumintunsigned instance_id
 }
 character_buffs {
 intunsigned character_id
 smallintunsigned spell_id
 }
 character_corpses {
 intunsigned id
 intunsigned charid
 varchar charname
 smallintunsigned instance_id
 smallint zone_id
 }
 character_currency {
 intunsigned id
 }
 character_data ||--o{ character_bandolier : "Has-Many"
 character_data ||--o{ character_bind : "Has-Many"
 character_data ||--o{ character_buffs : "Has-Many"
 character_data ||--o{ character_corpses : "Has-Many"
 character_data ||--o{ character_currency : "Has-Many"
 character_data ||--o{ character_corpses : "Has-Many"

```

```
erDiagram
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 character_disciplines {
 intunsigned id
 smallintunsigned disc_id
 }
 character_enabledtasks {
 intunsigned charid
 intunsigned taskid
 }
 character_exp_modifiers {
 int character_id
 int zone_id
 }
 character_expedition_lockouts {
 intunsigned character_id
 }
 character_inspect_messages {
 intunsigned id
 }
 character_data ||--o{ character_disciplines : "Has-Many"
 character_data ||--o{ character_enabledtasks : "Has-Many"
 character_data ||--o{ character_exp_modifiers : "Has-Many"
 character_data ||--o{ character_expedition_lockouts : "Has-Many"
 character_data ||--o{ character_inspect_messages : "Has-Many"

```

```
erDiagram
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 character_instance_safereturns {
 intunsigned character_id
 int instance_zone_id
 int instance_id
 int safe_zone_id
 }
 character_item_recast {
 intunsigned id
 intunsigned recast_type
 }
 character_languages {
 intunsigned id
 }
 character_leadership_abilities {
 intunsigned id
 }
 character_material {
 intunsigned id
 }
 character_data ||--o{ character_instance_safereturns : "Has-Many"
 character_data ||--o{ character_item_recast : "Has-Many"
 character_data ||--o{ character_languages : "Has-Many"
 character_data ||--o{ character_leadership_abilities : "Has-Many"
 character_data ||--o{ character_material : "Has-Many"

```

```
erDiagram
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 character_memmed_spells {
 intunsigned id
 smallintunsigned spell_id
 }
 character_peqzone_flags {
 int id
 int zone_id
 }
 character_potionbelt {
 intunsigned id
 intunsigned icon
 intunsigned item_id
 }
 character_skills {
 intunsigned id
 }
 character_spells {
 intunsigned id
 smallintunsigned spell_id
 }
 character_data ||--o{ character_memmed_spells : "Has-Many"
 character_data ||--o{ character_peqzone_flags : "Has-Many"
 character_data ||--o{ character_potionbelt : "Has-Many"
 character_data ||--o{ character_skills : "Has-Many"
 character_data ||--o{ character_spells : "Has-Many"

```

```
erDiagram
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 character_task_timers {
 intunsigned character_id
 intunsigned task_id
 }
 character_tasks {
 intunsigned charid
 intunsigned taskid
 tinyint type
 }
 character_tribute {
 intunsigned character_id
 int id
 }
 completed_shared_task_members {
 bigint character_id
 bigint shared_task_id
 }
 completed_tasks {
 intunsigned charid
 intunsigned taskid
 int activityid
 }
 character_data ||--o{ character_task_timers : "Has-Many"
 character_data ||--o{ character_tasks : "Has-Many"
 character_data ||--o{ character_tribute : "Has-Many"
 character_data ||--o{ completed_shared_task_members : "Has-Many"
 character_data ||--o{ completed_tasks : "Has-Many"

```

```
erDiagram
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 dynamic_zone_members {
 intunsigned character_id
 intunsigned dynamic_zone_id
 }
 friends {
 intunsigned charid
 varchar name
 }
 group_id {
 int charid
 int groupid
 }
 guilds {
 int id
 int leader
 varchar motd_setter
 }
 instance_list_player {
 intunsigned charid
 intunsigned id
 }
 character_data ||--o{ dynamic_zone_members : "Has-Many"
 character_data ||--o{ friends : "Has-Many"
 character_data ||--o{ group_id : "One-to-One"
 character_data ||--o{ guilds : "One-to-One"
 character_data ||--o{ instance_list_player : "Has-Many"
 character_data ||--o{ guilds : "One-to-One"

```

```
erDiagram
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 inventory {
 intunsigned charid
 intunsigned itemid
 mediumintunsigned augslot1
 mediumintunsigned augslot2
 mediumintunsigned augslot3
 mediumintunsigned augslot4
 mediumintunsigned augslot5
 mediumint augslot6
 }
 inventory_snapshots {
 intunsigned charid
 intunsigned itemid
 mediumintunsigned augslot1
 mediumintunsigned augslot2
 mediumintunsigned augslot3
 mediumintunsigned augslot4
 mediumintunsigned augslot5
 mediumint augslot6
 }
 mail {
 intunsigned charid
 varchar from
 }
 mercs {
 intunsigned OwnerCharacterID
 intunsigned TemplateID
 intunsigned MercID
 tinyintunsigned StanceID
 }
 qs_merchant_transaction_record {
 int char_id
 int merchant_id
 int zone_id
 }
 character_data ||--o{ inventory : "Has-Many"
 character_data ||--o{ inventory_snapshots : "Has-Many"
 character_data ||--o{ mail : "Has-Many"
 character_data ||--o{ mercs : "Has-Many"
 character_data ||--o{ qs_merchant_transaction_record : "Has-Many"

```

```
erDiagram
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 qs_player_aa_rate_hourly {
 int char_id
 }
 qs_player_delete_record {
 int char_id
 }
 qs_player_events {
 int char_id
 }
 qs_player_handin_record {
 int char_id
 int npc_id
 }
 qs_player_move_record {
 int char_id
 }
 character_data ||--o{ qs_player_aa_rate_hourly : "Has-Many"
 character_data ||--o{ qs_player_delete_record : "Has-Many"
 character_data ||--o{ qs_player_events : "Has-Many"
 character_data ||--o{ qs_player_handin_record : "Has-Many"
 character_data ||--o{ qs_player_move_record : "Has-Many"

```

```
erDiagram
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 qs_player_npc_kill_record_entries {
 int char_id
 }
 qs_player_speech {
 varchar from
 varchar to
 int guilddbid
 }
 qs_player_trade_record {
 int char1_id
 int char2_id
 }
 qs_player_trade_record_entries {
 int from_id
 int to_id
 int item_id
 int aug_1
 int aug_2
 int aug_3
 int aug_4
 int aug_5
 }
 quest_globals {
 int charid
 varchar name
 int npcid
 int zoneid
 }
 character_data ||--o{ qs_player_npc_kill_record_entries : "Has-Many"
 character_data ||--o{ qs_player_speech : "Has-Many"
 character_data ||--o{ qs_player_speech : "Has-Many"
 character_data ||--o{ qs_player_trade_record : "Has-Many"
 character_data ||--o{ qs_player_trade_record : "Has-Many"
 character_data ||--o{ qs_player_trade_record_entries : "Has-Many"
 character_data ||--o{ qs_player_trade_record_entries : "Has-Many"
 character_data ||--o{ quest_globals : "Has-Many"

```

```
erDiagram
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 raid_members {
 int charid
 varchar name
 int raidid
 }
 shared_task_members {
 bigint character_id
 bigint shared_task_id
 }
 timers {
 int char_id
 }
 titles {
 int char_id
 int title_set
 int item_id
 }
 trader {
 intunsigned char_id
 intunsigned item_id
 }
 character_data ||--o{ raid_members : "One-to-One"
 character_data ||--o{ shared_task_members : "One-to-One"
 character_data ||--o{ timers : "Has-Many"
 character_data ||--o{ titles : "Has-Many"
 character_data ||--o{ trader : "Has-Many"
 character_data ||--o{ raid_members : "One-to-One"

```

```
erDiagram
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 zone_flags {
 int charID
 int zoneID
 varchar zoneid
 }
 discovered_items {
 varchar char_name
 intunsigned item_id
 }
 eventlog {
 varchar accountid
 varchar accountname
 varchar charname
 }
 group_leaders {
 varchar assist
 varchar leadername
 varchar maintank
 varchar mentoree
 varchar puller
 int gid
 }
 hackers {
 varchar account
 varchar name
 varchar zone
 }
 character_data ||--o{ zone_flags : "Has-Many"
 character_data ||--o{ discovered_items : "Has-Many"
 character_data ||--o{ eventlog : "Has-Many"
 character_data ||--o{ group_leaders : "Has-Many"
 character_data ||--o{ group_leaders : "Has-Many"
 character_data ||--o{ group_leaders : "Has-Many"
 character_data ||--o{ group_leaders : "Has-Many"
 character_data ||--o{ group_leaders : "Has-Many"
 character_data ||--o{ hackers : "One-to-One"

```

```
erDiagram
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 lfguild {
 varchar name
 }
 petitions {
 varchar accountname
 varchar charname
 varchar lastgm
 varchar zone
 }
 reports {
 varchar name
 }
 trader_audit {
 varchar buyer
 varchar seller
 varchar itemname
 }
 character_data ||--o{ lfguild : "One-to-One"
 character_data ||--o{ petitions : "Has-Many"
 character_data ||--o{ reports : "Has-Many"
 character_data ||--o{ trader_audit : "Has-Many"
 character_data ||--o{ trader_audit : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| id 
| adventure_members 
| charid 

| Has-Many 
| id 
| adventure_stats 
| player_id 

| Has-Many 
| id 
| char_recipe_list 
| char_id 

| Has-Many 
| id 
| character_pet_buffs 
| char_id 

| Has-Many 
| id 
| character_pet_info 
| char_id 

| Has-Many 
| id 
| character_pet_inventory 
| char_id 

| Has-Many 
| id 
| faction_values 
| char_id 

| Has-Many 
| id 
| guild_members 
| char_id 

| Has-Many 
| id 
| keyring 
| char_id 

| Has-Many 
| id 
| player_titlesets 
| char_id 

| Has-Many 
| id 
| buyer 
| charid 

| Has-Many 
| id 
| character_activities 
| charid 

| Has-Many 
| id 
| character_alt_currency 
| char_id 

| Has-Many 
| id 
| character_alternate_abilities 
| id 

| Has-Many 
| id 
| character_auras 
| id 

| Has-Many 
| id 
| character_bandolier 
| id 

| Has-Many 
| id 
| character_bind 
| id 

| Has-Many 
| id 
| character_buffs 
| character_id 

| Has-Many 
| id 
| character_corpses 
| charid 

| Has-Many 
| id 
| character_currency 
| id 

| Has-Many 
| id 
| character_disciplines 
| id 

| Has-Many 
| id 
| character_enabledtasks 
| charid 

| Has-Many 
| id 
| character_exp_modifiers 
| character_id 

| Has-Many 
| id 
| character_expedition_lockouts 
| character_id 

| Has-Many 
| id 
| character_inspect_messages 
| id 

| Has-Many 
| id 
| character_instance_safereturns 
| character_id 

| Has-Many 
| id 
| character_item_recast 
| id 

| Has-Many 
| id 
| character_languages 
| id 

| Has-Many 
| id 
| character_leadership_abilities 
| id 

| Has-Many 
| id 
| character_material 
| id 

| Has-Many 
| id 
| character_memmed_spells 
| id 

| Has-Many 
| id 
| character_peqzone_flags 
| id 

| Has-Many 
| id 
| character_pet_buffs 
| char_id 

| Has-Many 
| id 
| character_pet_info 
| char_id 

| Has-Many 
| id 
| character_pet_inventory 
| char_id 

| Has-Many 
| id 
| character_potionbelt 
| id 

| Has-Many 
| id 
| character_skills 
| id 

| Has-Many 
| id 
| character_spells 
| id 

| Has-Many 
| id 
| character_task_timers 
| character_id 

| Has-Many 
| id 
| character_tasks 
| charid 

| Has-Many 
| id 
| character_tribute 
| character_id 

| Has-Many 
| id 
| completed_shared_task_members 
| character_id 

| Has-Many 
| id 
| completed_tasks 
| charid 

| Has-Many 
| id 
| dynamic_zone_members 
| character_id 

| Has-Many 
| id 
| faction_values 
| char_id 

| Has-Many 
| id 
| friends 
| charid 

| One-to-One 
| id 
| group_id 
| charid 

| One-to-One 
| id 
| guild_members 
| char_id 

| One-to-One 
| id 
| guilds 
| leader 

| Has-Many 
| id 
| instance_list_player 
| charid 

| Has-Many 
| id 
| inventory 
| charid 

| Has-Many 
| id 
| inventory_snapshots 
| charid 

| Has-Many 
| id 
| keyring 
| char_id 

| Has-Many 
| id 
| mail 
| charid 

| Has-Many 
| id 
| mercs 
| OwnerCharacterID 

| Has-Many 
| id 
| player_titlesets 
| char_id 

| Has-Many 
| id 
| qs_merchant_transaction_record 
| char_id 

| Has-Many 
| id 
| qs_player_aa_rate_hourly 
| char_id 

| Has-Many 
| id 
| qs_player_delete_record 
| char_id 

| Has-Many 
| id 
| qs_player_events 
| char_id 

| Has-Many 
| id 
| qs_player_handin_record 
| char_id 

| Has-Many 
| id 
| qs_player_move_record 
| char_id 

| Has-Many 
| id 
| qs_player_npc_kill_record_entries 
| char_id 

| Has-Many 
| id 
| qs_player_speech 
| from 

| Has-Many 
| id 
| qs_player_speech 
| to 

| Has-Many 
| id 
| qs_player_trade_record 
| char1_id 

| Has-Many 
| id 
| qs_player_trade_record 
| char2_id 

| Has-Many 
| id 
| qs_player_trade_record_entries 
| from_id 

| Has-Many 
| id 
| qs_player_trade_record_entries 
| to_id 

| Has-Many 
| id 
| quest_globals 
| charid 

| One-to-One 
| id 
| raid_members 
| charid 

| One-to-One 
| id 
| shared_task_members 
| character_id 

| Has-Many 
| id 
| timers 
| char_id 

| Has-Many 
| id 
| titles 
| char_id 

| Has-Many 
| id 
| trader 
| char_id 

| Has-Many 
| id 
| zone_flags 
| charID 

| Has-Many 
| name 
| character_corpses 
| charname 

| Has-Many 
| name 
| discovered_items 
| char_name 

| Has-Many 
| name 
| eventlog 
| charname 

| Has-Many 
| name 
| group_leaders 
| assist 

| Has-Many 
| name 
| group_leaders 
| leadername 

| Has-Many 
| name 
| group_leaders 
| maintank 

| Has-Many 
| name 
| group_leaders 
| mentoree 

| Has-Many 
| name 
| group_leaders 
| puller 

| One-to-One 
| name 
| guilds 
| motd_setter 

| One-to-One 
| name 
| hackers 
| name 

| One-to-One 
| nane 
| lfguild 
| name 

| Has-Many 
| name 
| petitions 
| charname 

| One-to-One 
| name 
| raid_members 
| name 

| Has-Many 
| name 
| reports 
| name 

| Has-Many 
| name 
| trader_audit 
| buyer 

| Has-Many 
| name 
| trader_audit 
| seller 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Character Identifier 

| account_id 
| int 
| Account Identifier 

| name 
| varchar 
| Name 

| last_name 
| varchar 
| Last Name 

| title 
| varchar 
| Title 

| suffix 
| varchar 
| Suffix 

| zone_id 
| int 
| Zone Identifier 

| zone_instance 
| int 
| Zone Instance Identifier 

| y 
| float 
| Y Coordinate 

| x 
| float 
| X Coordinate 

| z 
| float 
| Z Coordinate 

| heading 
| float 
| Heading Coordinate 

| gender 
| tinyint 
| Gender 

| race 
| smallint 
| Race 

| class 
| tinyint 
| Class 

| level 
| int 
| Level 

| deity 
| int 
| Deity 

| birthday 
| int 
| UNIX Timestamp of Birthday 

| last_login 
| int 
| UNIX Timestamp of Last Login 

| time_played 
| int 
| Time Played 

| level2 
| tinyint 
| Level 2 

| anon 
| tinyint 
| Anon: 0 = False, 1 = Anonymous, 2 = Roleplaying 

| gm 
| tinyint 
| GM: 0 = False, 1 = True 

| face 
| int 
| Face 

| hair_color 
| tinyint 
| Hair Color 

| hair_style 
| tinyint 
| Hair Style 

| beard 
| tinyint 
| Beard 

| beard_color 
| tinyint 
| Beard Color 

| eye_color_1 
| tinyint 
| Eye Color 1 

| eye_color_2 
| tinyint 
| Eye Color 2 

| drakkin_heritage 
| int 
| Drakkin Heritage 

| drakkin_tattoo 
| int 
| Drakkin Tattoo 

| drakkin_details 
| int 
| Drakkin Details 

| ability_time_seconds 
| tinyint 
| Ability Timer in Seconds 

| ability_number 
| tinyint 
| Ability Number 

| ability_time_minutes 
| tinyint 
| Ability Timer in Minutes 

| ability_time_hours 
| tinyint 
| Ability Timer in Hours 

| exp 
| int 
| Experience 

| exp_enabled 
| tinyint 
| Experience Enabled: 0 = False, 1 = True 

| aa_points_spent 
| int 
| AA Points Spent 

| aa_exp 
| int 
| AA Experience 

| aa_points 
| int 
| AA Points 

| group_leadership_exp 
| int 
| Group Leadership Experience 

| raid_leadership_exp 
| int 
| Raid Leadership Experience 

| group_leadership_points 
| int 
| Group Leadership Points 

| raid_leadership_points 
| int 
| Raid Leadership Points 

| points 
| int 
| Points 

| cur_hp 
| int 
| Health 

| mana 
| int 
| Mana 

| endurance 
| int 
| Endurance 

| intoxication 
| int 
| Intoxication 

| str 
| int 
| Strength 

| sta 
| int 
| Stamina 

| cha 
| int 
| Charisma 

| dex 
| int 
| Dexterity 

| int 
| int 
| Intelligence 

| agi 
| int 
| Agility 

| wis 
| int 
| Wisdom 

| zone_change_count 
| int 
| Zone Change Count 

| toxicity 
| int 
| Toxicity 

| hunger_level 
| int 
| Hunger Level 

| thirst_level 
| int 
| Thirst Level 

| ability_up 
| int 
| Ability Up 

| ldon_points_guk 
| int 
| LDoN Points - Deepest Guk 

| ldon_points_mir 
| int 
| LDoN Points - Miragul's Menagerie 

| ldon_points_mmc 
| int 
| LDoN Points - Mistmoore Catacombs 

| ldon_points_ruj 
| int 
| LDoN Points - Rujarkian Hills 

| ldon_points_tak 
| int 
| LDoN Points - Takish-Hiz 

| ldon_points_available 
| int 
| LDoN Points Available 

| tribute_time_remaining 
| int 
| Tribute Time Remaining 

| career_tribute_points 
| int 
| Career Tribute Points 

| tribute_points 
| int 
| Tribute Points 

| tribute_active 
| int 
| Tribute Active: 0 = False, 1 = True 

| pvp_status 
| tinyint 
| PVP Status: 0 = False, 1 = True 

| pvp_kills 
| int 
| PVP Kills 

| pvp_deaths 
| int 
| PVP Deaths 

| pvp_current_points 
| int 
| PVP Points 

| pvp_career_points 
| int 
| Career PVP Points 

| pvp_best_kill_streak 
| int 
| Best Kill Streak 

| pvp_worst_death_streak 
| int 
| Worse Death Streak 

| pvp_current_kill_streak 
| int 
| Current Kill Streak 

| pvp2 
| int 
| PVP Status: 0 = False, 1 = True 

| pvp_type 
| int 
| PVP Type 

| show_helm 
| int 
| Show Helm: 0 = False, 1 = True 

| group_auto_consent 
| tinyint 
| Group Auto Consent: 0 = False, 1 = True 

| raid_auto_consent 
| tinyint 
| Raid Auto Consent: 0 = False, 1 = True 

| guild_auto_consent 
| tinyint 
| Guild Auto Consent: 0 = False, 1 = True 

| leadership_exp_on 
| tinyint 
| Leadership Experience On : 0 = False, 1 = True 

| RestTimer 
| int 
| Rest Timer 

| air_remaining 
| int 
| Air Remaining 

| autosplit_enabled 
| int 
| Autosplit Enabled: 0 = False, 1 = True 

| lfp 
| tinyint 
| Looking For Party: 0 = False, 1 = True 

| lfg 
| tinyint 
| Looking For Guild: 0 = False, 1 = True 

| mailkey 
| char 
| Mail Key 

| xtargets 
| tinyint 
| XTargets 

| firstlogon 
| tinyint 
| First Logon 

| e_aa_effects 
| int 
| Experience AA Effects 

| e_percent_to_aa 
| int 
| Experience Percentage to AA Points 

| e_expended_aa_spent 
| int 
| Expended AA Points Spent 

| aa_points_spent_old 
| int 
| AA Points Spent Old 

| aa_points_old 
| int 
| AA Points Old 

| e_last_invsnapshot 
| int 
| Last Inventory Snapshot 

| deleted_at 
| datetime 
| Deleted At Unix Timestamp

---

## character_disciplines

*Source: schema/characters/character_disciplines/index.html*

# character_disciplines¶

## Relationships¶

```
erDiagram
 character_disciplines {
 intunsigned id
 smallintunsigned disc_id
 }
 spells_new {
 int id
 int descnum
 int effectdescnum
 int effectdescnum2
 int typedescnum
 varchar teleport_zone
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 character_disciplines ||--o{ spells_new : "One-to-One"
 character_disciplines ||--o{ character_data : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| disc_id 
| spells_new 
| id 

| One-to-One 
| id 
| character_data 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Character Identifier 

| slot_id 
| smallint 
| Slot Identifier 

| disc_id 
| smallint 
| Discipline Identifier

---

## character_enabledtasks

*Source: schema/characters/character_enabledtasks/index.html*

# character_enabledtasks¶

## Relationships¶

```
erDiagram
 character_enabledtasks {
 intunsigned charid
 intunsigned taskid
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 tasks {
 intunsigned id
 tinyint type
 intunsigned dz_template_id
 }
 character_enabledtasks ||--o{ character_data : "One-to-One"
 character_enabledtasks ||--o{ tasks : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| charid 
| character_data 
| id 

| One-to-One 
| taskid 
| tasks 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| charid 
| int 
| Character Identifier 

| taskid 
| int 
| Task Identifier

---

## character_exp_modifiers

*Source: schema/characters/character_exp_modifiers/index.html*

# character_exp_modifiers¶

## Relationships¶

```
erDiagram
 character_exp_modifiers {
 int character_id
 int zone_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 character_exp_modifiers ||--o{ character_data : "One-to-One"
 character_exp_modifiers ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| character_id 
| character_data 
| id 

| One-to-One 
| zone_id 
| zone 
| zoneidnumber 

## Schema¶

| 

Column 
| Data Type 
| Description 

| character_id 
| int 
| Character Identifier 

| zone_id 
| int 
| Zone Identifier (0 for Global) 

| instance_version 
| int 
| Instance Version 

| aa_modifier 
| float 
| AA Experience Modifier (.5 = 50%, 1 = 100%, 1.5 = 150%) 

| exp_modifier 
| float 
| Experience Modifier (.5 = 50%, 1 = 100%, 1.5 = 150%)

---

## character_expedition_lockouts

*Source: schema/characters/character_expedition_lockouts/index.html*

# character_expedition_lockouts¶

## Relationships¶

```
erDiagram
 character_expedition_lockouts {
 intunsigned character_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 character_expedition_lockouts ||--o{ character_data : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| character_id 
| character_data 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Lockout Identifier 

| character_id 
| int 
| Character Identifier 

| expedition_name 
| varchar 
| Expedition Name 

| event_name 
| varchar 
| Event Name 

| expire_time 
| datetime 
| Expire Time 

| duration 
| int 
| Duration in Seconds 

| from_expedition_uuid 
| varchar 
| From Expedition UUID

---

## character_inspect_messages

*Source: schema/characters/character_inspect_messages/index.html*

# character_inspect_messages¶

## Relationships¶

```
erDiagram
 character_inspect_messages {
 intunsigned id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 character_inspect_messages ||--o{ character_data : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| id 
| character_data 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Character Identifier 

| inspect_message 
| varchar 
| Inspect Message

---

## character_instance_safereturns

*Source: schema/characters/character_instance_safereturns/index.html*

# character_instance_safereturns¶

## Relationships¶

```
erDiagram
 character_instance_safereturns {
 intunsigned character_id
 int instance_zone_id
 int instance_id
 int safe_zone_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 instance_list {
 int id
 tinyintunsigned version
 intunsigned zone
 }
 character_instance_safereturns ||--o{ character_data : "One-to-One"
 character_instance_safereturns ||--o{ zone : "One-to-One"
 character_instance_safereturns ||--o{ instance_list : "One-to-One"
 character_instance_safereturns ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| character_id 
| character_data 
| id 

| One-to-One 
| instance_zone_id 
| zone 
| zoneidnumber 

| One-to-One 
| instance_id 
| instance_list 
| id 

| One-to-One 
| safe_zone_id 
| zone 
| zoneidnumber 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Safe Return Identifier 

| character_id 
| int 
| Character Identifier 

| instance_zone_id 
| int 
| Instance Zone Identifier 

| instance_id 
| int 
| Instance Identifier 

| safe_zone_id 
| int 
| Save Zone Identifier 

| safe_x 
| float 
| Safe X Coordinate 

| safe_y 
| float 
| Safe Y Coordinate 

| safe_z 
| float 
| Safe Z Coordinate 

| safe_heading 
| float 
| Safe Heading Coordinate

---

## character_item_recast

*Source: schema/characters/character_item_recast/index.html*

# character_item_recast¶

## Relationships¶

```
erDiagram
 character_item_recast {
 intunsigned id
 intunsigned recast_type
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 character_item_recast ||--o{ character_data : "One-to-One"
 character_item_recast ||--o{ items : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| id 
| character_data 
| id 

| Has-Many 
| recast_type 
| items 
| recasttype 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Character Identifier 

| recast_type 
| int 
| Recast Type 

| timestamp 
| int 
| Recast Timestamp

---

## character_languages

*Source: schema/characters/character_languages/index.html*

# character_languages¶

## Relationships¶

```
erDiagram
 character_languages {
 intunsigned id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 character_languages ||--o{ character_data : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| id 
| character_data 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Character Identifier 

| lang_id 
| smallint 
| Language Identifier 

| value 
| smallint 
| Skill Level

---

## character_leadership_abilities

*Source: schema/characters/character_leadership_abilities/index.html*

# character_leadership_abilities¶

## Relationships¶

```
erDiagram
 character_leadership_abilities {
 intunsigned id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 character_leadership_abilities ||--o{ character_data : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| id 
| character_data 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Character Identifier 

| slot 
| smallint 
| Slot 

| rank 
| smallint 
| Rank

---

## character_material

*Source: schema/characters/character_material/index.html*

# character_material¶

## Relationships¶

```
erDiagram
 character_material {
 intunsigned id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 character_material ||--o{ character_data : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| id 
| character_data 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Character Identifier 

| slot 
| tinyint 
| Slot 

| blue 
| tinyint 
| Blue: 0 = None, 255 = Max 

| green 
| tinyint 
| Green: 0 = None, 255 = Max 

| red 
| tinyint 
| Red: 0 = None, 255 = Max 

| use_tint 
| tinyint 
| Tint: 0 = None, 255 = MAx 

| color 
| int 
| Color

---

## character_memmed_spells

*Source: schema/characters/character_memmed_spells/index.html*

# character_memmed_spells¶

## Relationships¶

```
erDiagram
 character_memmed_spells {
 intunsigned id
 smallintunsigned spell_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 spells_new {
 int id
 int descnum
 int effectdescnum
 int effectdescnum2
 int typedescnum
 varchar teleport_zone
 }
 character_memmed_spells ||--o{ character_data : "One-to-One"
 character_memmed_spells ||--o{ spells_new : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| id 
| character_data 
| id 

| One-to-One 
| spell_id 
| spells_new 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Character Identifier 

| slot_id 
| smallint 
| Slot Identifier 

| spell_id 
| smallint 
| Spell Identifier

---

## character_peqzone_flags

*Source: schema/characters/character_peqzone_flags/index.html*

# character_peqzone_flags¶

## Relationships¶

```
erDiagram
 character_peqzone_flags {
 int id
 int zone_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 character_peqzone_flags ||--o{ character_data : "One-to-One"
 character_peqzone_flags ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| id 
| character_data 
| id 

| One-to-One 
| zone_id 
| zone 
| zoneidnumber 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Flag Identifier 

| zone_id 
| int 
| Zone Identifier

---

## character_pet_buffs

*Source: schema/characters/character_pet_buffs/index.html*

# character_pet_buffs¶

## Relationships¶

```
erDiagram
 character_pet_buffs {
 int char_id
 int spell_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 spells_new {
 int id
 int descnum
 int effectdescnum
 int effectdescnum2
 int typedescnum
 varchar teleport_zone
 }
 character_pet_buffs ||--o{ character_data : "One-to-One"
 character_pet_buffs ||--o{ spells_new : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| char_id 
| character_data 
| id 

| One-to-One 
| spell_id 
| spells_new 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| char_id 
| int 
| Character Identifier 

| pet 
| int 
| Pet 

| slot 
| int 
| Slot 

| spell_id 
| int 
| Spell Identifier 

| caster_level 
| tinyint 
| Caster Level 

| castername 
| varchar 
| Caster Name 

| ticsremaining 
| int 
| Tics Remaining 

| counters 
| int 
| Counters 

| numhits 
| int 
| Number of Hits 

| rune 
| int 
| Rune 

| instrument_mod 
| tinyint 
| Instrument Modifier

---

## character_pet_info

*Source: schema/characters/character_pet_info/index.html*

# character_pet_info¶

## Relationships¶

```
erDiagram
 character_pet_info {
 int char_id
 int spell_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 spells_new {
 int id
 int descnum
 int effectdescnum
 int effectdescnum2
 int typedescnum
 varchar teleport_zone
 }
 character_pet_info ||--o{ character_data : "One-to-One"
 character_pet_info ||--o{ spells_new : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| char_id 
| character_data 
| id 

| One-to-One 
| spell_id 
| spells_new 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| char_id 
| int 
| Character Identifier 

| pet 
| int 
| Pet 

| petname 
| varchar 
| Pet Name 

| petpower 
| int 
| Pet Power 

| spell_id 
| int 
| Spell Identifier 

| hp 
| int 
| Health 

| mana 
| int 
| Mana 

| size 
| float 
| Size 

| taunting 
| tinyint 
| Taunting: 0 = False, 1 = True

---

## character_pet_inventory

*Source: schema/characters/character_pet_inventory/index.html*

# character_pet_inventory¶

## Relationships¶

```
erDiagram
 character_pet_inventory {
 int char_id
 int item_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 character_pet_inventory ||--o{ character_data : "One-to-One"
 character_pet_inventory ||--o{ items : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| char_id 
| character_data 
| id 

| One-to-One 
| item_id 
| items 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| char_id 
| int 
| Character Identifier 

| pet 
| int 
| Pet 

| slot 
| int 
| Slot 

| item_id 
| int 
| Item Identifier

---

## character_potionbelt

*Source: schema/characters/character_potionbelt/index.html*

# character_potionbelt¶

## Relationships¶

```
erDiagram
 character_potionbelt {
 intunsigned id
 intunsigned icon
 intunsigned item_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 character_potionbelt ||--o{ character_data : "One-to-One"
 character_potionbelt ||--o{ items : "One-to-One"
 character_potionbelt ||--o{ items : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| id 
| character_data 
| id 

| One-to-One 
| icon 
| items 
| icon 

| One-to-One 
| item_id 
| items 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Character Identifier 

| potion_id 
| tinyint 
| Potion Identifier 

| item_id 
| int 
| Item Identifier 

| icon 
| int 
| Icon

---

## character_skills

*Source: schema/characters/character_skills/index.html*

# character_skills¶

## Relationships¶

```
erDiagram
 character_skills {
 intunsigned id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 character_skills ||--o{ character_data : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| id 
| character_data 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Character Identifier 

| skill_id 
| smallint 
| Skill Identifier 

| value 
| smallint 
| Skill Level

---

## character_spells

*Source: schema/characters/character_spells/index.html*

# character_spells¶

## Relationships¶

```
erDiagram
 character_spells {
 intunsigned id
 smallintunsigned spell_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 spells_new {
 int id
 int descnum
 int effectdescnum
 int effectdescnum2
 int typedescnum
 varchar teleport_zone
 }
 character_spells ||--o{ character_data : "One-to-One"
 character_spells ||--o{ spells_new : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| id 
| character_data 
| id 

| One-to-One 
| spell_id 
| spells_new 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Character Identifier 

| slot_id 
| smallint 
| Slot Identifier 

| spell_id 
| smallint 
| Spell Identifier

---

## character_task_timers

*Source: schema/characters/character_task_timers/index.html*

# character_task_timers¶

## Relationships¶

```
erDiagram
 character_task_timers {
 intunsigned character_id
 intunsigned task_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 tasks {
 intunsigned id
 tinyint type
 intunsigned dz_template_id
 }
 character_task_timers ||--o{ character_data : "One-to-One"
 character_task_timers ||--o{ tasks : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| character_id 
| character_data 
| id 

| One-to-One 
| task_id 
| tasks 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Task Timer Identifier 

| character_id 
| int 
| Character Identifer 

| task_id 
| int 
| Task Identifier 

| timer_type 
| int 
| Timer Type (0 = Replay, 1 = Request) 

| timer_group 
| int 
| Group Timer 

| expire_time 
| datetime 
| Expire Time

---

## character_tasks

*Source: schema/characters/character_tasks/index.html*

# character_tasks¶

## Relationships¶

```
erDiagram
 character_tasks {
 intunsigned charid
 intunsigned taskid
 tinyint type
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 tasks {
 intunsigned id
 tinyint type
 intunsigned dz_template_id
 }
 character_tasks ||--o{ character_data : "One-to-One"
 character_tasks ||--o{ tasks : "One-to-One"
 character_tasks ||--o{ tasks : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| charid 
| character_data 
| id 

| One-to-One 
| taskid 
| tasks 
| id 

| One-to-One 
| type 
| tasks 
| type 

## Schema¶

| 

Column 
| Data Type 
| Description 

| charid 
| int 
| Character Identifier 

| taskid 
| int 
| Task Identifier 

| slot 
| int 
| Slot 

| type 
| tinyint 
| Task Type 

| acceptedtime 
| int 
| Accepted Time UNIX Timestamp 

| was_rewarded 
| tinyint 
| Was Rewarded: 0 = False, 1 = True

---

## character_tribute

*Source: schema/characters/character_tribute/index.html*

# character_tribute¶

## Relationships¶

```
erDiagram
 character_tribute {
 intunsigned character_id
 int id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 character_tribute ||--o{ character_data : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| id 
| character_data 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Tribute Identifier 

| character_id 
| int 
| Character Identifier 

| tier 
| tinyint 
| Tier 

| tribute 
| int 
| Tribute

---

## friends

*Source: schema/characters/friends/index.html*

# friends¶

## Relationships¶

```
erDiagram
 friends {
 intunsigned charid
 varchar name
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 friends ||--o{ character_data : "One-to-One"
 friends ||--o{ character_data : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| charid 
| character_data 
| id 

| One-to-One 
| name 
| character_data 
| name 

## Schema¶

| 

Column 
| Data Type 
| Description 

| charid 
| int 
| Character Identifier 

| type 
| tinyint 
| Type: 0 = Ignore, 1 = Friend 

| name 
| varchar 
| Friend Name

---

## keyring

*Source: schema/characters/keyring/index.html*

# keyring¶

## Relationships¶

```
erDiagram
 keyring {
 int char_id
 int item_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 keyring ||--o{ character_data : "One-to-One"
 keyring ||--o{ items : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| char_id 
| character_data 
| id 

| One-to-One 
| item_id 
| items 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| 

| char_id 
| int 
| Character Identifier 

| item_id 
| int 
| Item Identifier

---

## lfguild

*Source: schema/characters/lfguild/index.html*

# lfguild¶

## Relationships¶

```
erDiagram
 lfguild {
 varchar name
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 lfguild ||--o{ character_data : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| name 
| character_data 
| name 

## Schema¶

| 

Column 
| Data Type 
| Description 

| type 
| tinyint 
| Type 

| name 
| varchar 
| Name 

| comment 
| varchar 
| Comment 

| fromlevel 
| tinyint 
| From Level 

| tolevel 
| tinyint 
| To Level 

| classes 
| int 
| Classes 

| aacount 
| int 
| AA Count 

| timezone 
| int 
| Time Zone 

| timeposted 
| int 
| Time Posted UNIX Timestamp

---

## mail

*Source: schema/characters/mail/index.html*

# mail¶

## Relationships¶

```
erDiagram
 mail {
 intunsigned charid
 varchar from
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 mail ||--o{ character_data : "One-to-One"
 mail ||--o{ character_data : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| charid 
| character_data 
| id 

| One-to-One 
| from 
| character_data 
| name 

## Schema¶

| 

Column 
| Data Type 
| Description 

| msgid 
| int 
| Unique Message Identifier 

| charid 
| int 
| Character Identifier 

| timestamp 
| int 
| UNIX Timestamp 

| from 
| varchar 
| From Character Name 

| subject 
| varchar 
| Subject 

| body 
| text 
| Body 

| to 
| text 
| To Character Name 

| status 
| tinyint 
| Status

---

## player_titlesets

*Source: schema/characters/player_titlesets/index.html*

# player_titlesets¶

## Relationships¶

```
erDiagram
 player_titlesets {
 intunsigned char_id
 intunsigned title_set
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 titles {
 int char_id
 int title_set
 int item_id
 }
 player_titlesets ||--o{ character_data : "One-to-One"
 player_titlesets ||--o{ titles : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| char_id 
| character_data 
| id 

| Has-Many 
| title_set 
| titles 
| title_set 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Title Set Identifier 

| char_id 
| int 
| Character Identifier 

| title_set 
| int 
| Title Set

---

## data_buckets

*Source: schema/data-storage/data_buckets/index.html*

# data_buckets¶

## Relationships¶

```
erDiagram
 data_buckets {
 varchar key
 }
 merchantlist {
 varchar content_flags
 varchar content_flags_disabled
 varchar bucket_name
 int item
 varchar merchant_id
 int merchantid
 }
 spell_buckets {
 varchar key
 bigintunsigned spellid
 }
 data_buckets ||--o{ merchantlist : "Has-Many"
 data_buckets ||--o{ spell_buckets : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| key 
| merchantlist 
| bucket_name 

| Has-Many 
| key 
| spell_buckets 
| key 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| bigint 
| Unique Data Bucket Identifier 

| key 
| varchar 
| Key 

| value 
| text 
| Value 

| expires 
| int 
| Expiration UNIX Timestamp 

| character_id 
| bigint 
| 

| npc_id 
| bigint 
| 

| bot_id 
| bigint 
|

---

## quest_globals

*Source: schema/data-storage/quest_globals/index.html*

# quest_globals¶

## Relationships¶

```
erDiagram
 quest_globals {
 int charid
 varchar name
 int npcid
 int zoneid
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 item_tick {
 varchar it_itemid
 varchar it_qglobal
 }
 merc_merchant_templates {
 varchar merc_merchant_template_id
 varchar qglobal
 }
 spell_globals {
 varchar qglobal
 int spellid
 }
 npc_types {
 intunsigned alt_currency_id
 int id
 int npc_faction_id
 text name
 intunsigned loottable_id
 intunsigned merchant_id
 intunsigned emoteid
 intunsigned adventure_template_id
 intunsigned armortint_id
 intunsigned npc_spells_id
 intunsigned npc_spells_effects_id
 intunsigned trap_template
 }
 quest_globals ||--o{ character_data : "One-to-One"
 quest_globals ||--o{ item_tick : "Has-Many"
 quest_globals ||--o{ merc_merchant_templates : "Has-Many"
 quest_globals ||--o{ spell_globals : "Has-Many"
 quest_globals ||--o{ npc_types : "One-to-One"

```

```
erDiagram
 quest_globals {
 int charid
 varchar name
 int npcid
 int zoneid
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 quest_globals ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| charid 
| character_data 
| id 

| Has-Many 
| name 
| item_tick 
| it_qglobal 

| Has-Many 
| name 
| merc_merchant_templates 
| qglobal 

| Has-Many 
| name 
| spell_globals 
| qglobal 

| One-to-One 
| npcid 
| npc_types 
| id 

| One-to-One 
| zoneid 
| zone 
| zoneidnumber 

## Schema¶

| 

Column 
| Data Type 
| Description 

| charid 
| int 
| Character Identifier 

| npcid 
| int 
| NPC Type Identifier 

| zoneid 
| int 
| Zone Identifier 

| name 
| varchar 
| Name 

| value 
| varchar 
| Value 

| expdate 
| int 
| Expiration Date UNIX Timestamp

---

## doors

*Source: schema/doors/doors/index.html*

# doors¶

## Relationships¶

```
erDiagram
 doors {
 varchar content_flags
 varchar content_flags_disabled
 int dz_switch_id
 int keyitem
 varchar zone
 varchar dest_zone
 intunsigned dest_instance
 smallint version
 }
 content_flags {
 varchar flag_name
 }
 dynamic_zones {
 int dz_switch_id
 intunsigned id
 intunsigned compass_zone_id
 int instance_id
 intunsigned safe_return_zone_id
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 doors ||--o{ content_flags : "One-to-One"
 doors ||--o{ content_flags : "One-to-One"
 doors ||--o{ dynamic_zones : "One-to-One"
 doors ||--o{ items : "One-to-One"
 doors ||--o{ zone : "One-to-One"
 doors ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| content_flags 
| content_flags 
| flag_name 

| One-to-One 
| content_flags_disabled 
| content_flags 
| flag_name 

| One-to-One 
| dz_switch_id 
| dynamic_zones 
| dz_switch_id 

| One-to-One 
| keyitem 
| items 
| id 

| One-to-One 
| zone 
| zone 
| short_name 

| One-to-One 
| dest_zone 
| zone 
| short_name 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Entry Identifier 

| doorid 
| smallint 
| Unique Door Identifier 

| zone 
| varchar 
| Zone Short Name 

| version 
| smallint 
| Zone Version: -1 For All 

| name 
| varchar 
| This is the name of the door, such as 'IT11161' or 'POPCREATE501', for names of objects you can see. 

| pos_y 
| float 
| Door Y Coordinate 

| pos_x 
| float 
| Door X Coordinate 

| pos_z 
| float 
| Door Z Coordinate 

| heading 
| float 
| Door Heading Coordinate 

| opentype 
| smallint 
| Door Open Type 

| guild 
| smallint 
| Guild Identifier 

| lockpick 
| smallint 
| Lockpicking Skill Required: -1 = Unpickable 

| keyitem 
| int 
| Item Identifier 

| nokeyring 
| tinyint 
| No Key Ring: 0 = False, 1 = True 

| triggerdoor 
| smallint 
| Trigger Door: 0 For Current Door or use a Unique Door Identifier 

| triggertype 
| smallint 
| Trigger Type: 1 = Open a Type 255 door, 255 = Will Not Open 

| disable_timer 
| tinyint 
| Disable Timer 

| doorisopen 
| smallint 
| Door Is Open: 0 = False, 1 = True 

| door_param 
| int 
| Door Parameter 

| dest_zone 
| varchar 
| Zone Short Name 

| dest_instance 
| int 
| Destination Instance 

| dest_x 
| float 
| Destination X Coordinate 

| dest_y 
| float 
| Destination Y Coordinate 

| dest_z 
| float 
| Destination Z Coordinate 

| dest_heading 
| float 
| Destination Heading Coordinate 

| invert_state 
| int 
| This column will basically behave like such: if the door has a click type and it is to raise up like a door, it will be raised on spawn of the door. Meaning it is inverted. Another example: If a Door Open Type is set to a spinning object on click, you could set this to 1 to have the door be spinning on spawn. 

| incline 
| int 
| Incline 

| size 
| smallint 
| Size 

| buffer 
| float 
| Unused 

| client_version_mask 
| int 
| Client Version Mask 

| is_ldon_door 
| smallint 
| Is LDoN Door: 0 = False, 1 = True 

| dz_switch_id 
| int 
| Dynamic Zone Switch Identifier 

| min_expansion 
| tinyint 
| Minimum Expansion](../../../../server/operation/expansion-list) 

| max_expansion 
| tinyint 
| Maximum Expansion](../../../../server/operation/expansion-list) 

| content_flags 
| varchar 
| Content Flags Required to be Enabled 

| content_flags_disabled 
| varchar 
| Content Flags Required to be Disabled

---

## dynamic_zone_members

*Source: schema/dynamic-zones/dynamic_zone_members/index.html*

# dynamic_zone_members¶

## Relationships¶

```
erDiagram
 dynamic_zone_members {
 intunsigned character_id
 intunsigned dynamic_zone_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 dynamic_zones {
 int dz_switch_id
 intunsigned id
 intunsigned compass_zone_id
 int instance_id
 intunsigned safe_return_zone_id
 }
 dynamic_zone_members ||--o{ character_data : "One-to-One"
 dynamic_zone_members ||--o{ dynamic_zones : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| character_id 
| character_data 
| id 

| One-to-One 
| dynamic_zone_id 
| dynamic_zones 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Dynamic Zone Member Identifier 

| dynamic_zone_id 
| int 
| Dynamic Zone Identifier 

| character_id 
| int 
| Character Identifier

---

## dynamic_zone_templates

*Source: schema/dynamic-zones/dynamic_zone_templates/index.html*

# dynamic_zone_templates¶

## Relationships¶

```
erDiagram
 dynamic_zone_templates {
 intunsigned id
 }
 tasks {
 intunsigned id
 tinyint type
 intunsigned dz_template_id
 }
 dynamic_zone_templates ||--o{ tasks : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| id 
| tasks 
| dz_template_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Dynamic Zone Template Unique Identifier 

| zone_id 
| int 
| Dynamic Zone Template Zone Identifier 

| zone_version 
| int 
| Zone Version 

| name 
| varchar 
| Dynamic Zone Template Name 

| min_players 
| int 
| Minimum Players 

| max_players 
| int 
| Maximum Players 

| duration_seconds 
| int 
| Duration in Seconds 

| dz_switch_id 
| int 
| Dynamic Zone Switch Identifier 

| compass_zone_id 
| int 
| Compass Zone Identifier 

| compass_x 
| float 
| Compass X Coordinate 

| compass_y 
| float 
| Compass Y Coordinate 

| compass_z 
| float 
| Compass Z Coordinatet 

| return_zone_id 
| int 
| Return Zone Identifier 

| return_x 
| float 
| Return X Coordinate 

| return_y 
| float 
| Return Y Coordinate 

| return_z 
| float 
| Return Z Coordinate 

| return_h 
| float 
| Return Heading Coordinate 

| override_zone_in 
| tinyint 
| Override Zone In: 0 = False, 1 = True 

| zone_in_x 
| float 
| Zone In X Coordinate 

| zone_in_y 
| float 
| Zone In Y Coordinate 

| zone_in_z 
| float 
| Zone In Z Coordinate 

| zone_in_h 
| float 
| Zone In Heading Coordinate

---

## dynamic_zones

*Source: schema/dynamic-zones/dynamic_zones/index.html*

# dynamic_zones¶

## Relationships¶

```
erDiagram
 dynamic_zones {
 int dz_switch_id
 intunsigned id
 intunsigned compass_zone_id
 int instance_id
 intunsigned safe_return_zone_id
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 doors {
 varchar content_flags
 varchar content_flags_disabled
 int dz_switch_id
 int keyitem
 varchar zone
 varchar dest_zone
 intunsigned dest_instance
 smallint version
 }
 dynamic_zone_members {
 intunsigned character_id
 intunsigned dynamic_zone_id
 }
 instance_list {
 int id
 tinyintunsigned version
 intunsigned zone
 }
 dynamic_zones ||--o{ zone : "One-to-One"
 dynamic_zones ||--o{ doors : "Has-Many"
 dynamic_zones ||--o{ dynamic_zone_members : "Has-Many"
 dynamic_zones ||--o{ instance_list : "One-to-One"
 dynamic_zones ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| compass_zone_id 
| zone 
| zoneidnumber 

| Has-Many 
| dz_switch_id 
| doors 
| dz_switch_id 

| Has-Many 
| id 
| dynamic_zone_members 
| dynamic_zone_id 

| One-to-One 
| instance_id 
| instance_list 
| id 

| One-to-One 
| safe_return_zone_id 
| zone 
| zoneidnumber 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Dynamic Zone Identifier 

| instance_id 
| int 
| Instance Identifier 

| type 
| tinyint 
| Type 

| uuid 
| varchar 
| UUID 

| name 
| varchar 
| Name 

| leader_id 
| int 
| Leader Character Identifier 

| min_players 
| int 
| Minimum Players 

| max_players 
| int 
| Maximum Players 

| dz_switch_id 
| int 
| Dynamic Zone Switch Identifier](../../schema/doors/doors.md) 

| compass_zone_id 
| int 
| Compass Zone Identifier 

| compass_x 
| float 
| Compass X Coordinate 

| compass_y 
| float 
| Compass Y Coordinate 

| compass_z 
| float 
| Compass Z Coordinate 

| safe_return_zone_id 
| int 
| Safe Return Zone Identifier 

| safe_return_x 
| float 
| Safe Return X Coordinate 

| safe_return_y 
| float 
| Safe Return Y Coordinate 

| safe_return_z 
| float 
| Safe Return Z Coordinate 

| safe_return_heading 
| float 
| Safe Return Heading Coordinate 

| zone_in_x 
| float 
| Zone In X Coordinate 

| zone_in_y 
| float 
| Zone In Y Coordinate 

| zone_in_z 
| float 
| Zone In Z Coordinate 

| zone_in_heading 
| float 
| Zone In Heading Coordinate 

| has_zone_in 
| tinyint 
| Has Zone In: 0 = False, 1 = True

---

## expedition_lockouts

*Source: schema/expeditions/expedition_lockouts/index.html*

# expedition_lockouts¶

## Relationships¶

```
erDiagram
 expedition_lockouts {
 intunsigned expedition_id
 }
 expeditions {
 intunsigned id
 intunsigned dynamic_zone_id
 }
 expedition_lockouts ||--o{ expeditions : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| expedition_id 
| expeditions 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Expedition Lockout Identifier 

| expedition_id 
| int 
| Expedition Identifier 

| event_name 
| varchar 
| Event Name 

| expire_time 
| datetime 
| Expire Time 

| duration 
| int 
| Duration in Seconds 

| from_expedition_uuid 
| varchar 
| From Expedition UUID

---

## expeditions

*Source: schema/expeditions/expeditions/index.html*

# expeditions¶

## Relationships¶

```
erDiagram
 expeditions {
 intunsigned id
 intunsigned dynamic_zone_id
 }
 dynamic_zones {
 int dz_switch_id
 intunsigned id
 intunsigned compass_zone_id
 int instance_id
 intunsigned safe_return_zone_id
 }
 expeditions ||--o{ dynamic_zones : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| dynamic_zone_id 
| dynamic_zones 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Expedition Identifier 

| dynamic_zone_id 
| int 
| Dynamic Zone Identifier 

| add_replay_on_join 
| tinyint 
| Add Replay On Join: 0 = False, 1 = True 

| is_locked 
| tinyint 
| Is Locked: 0 = False, 1 = True

---

## faction_association

*Source: schema/factions/faction_association/index.html*

# faction_association¶

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Faction Association Identifier 

| id_1 
| int 
| Faction 1 Identifier 

| mod_1 
| float 
| Faction 1 Modifier 

| id_2 
| int 
| Faction 2 Identifier 

| mod_2 
| float 
| Faction 2 Modifier 

| id_3 
| int 
| Faction 3 Identifier 

| mod_3 
| float 
| Faction 3 Modifier 

| id_4 
| int 
| Faction 4 Identifier 

| mod_4 
| float 
| Faction 4 Modifier 

| id_5 
| int 
| Faction 5 Identifier 

| mod_5 
| float 
| Faction 5 Modifier 

| id_6 
| int 
| Faction 6 Identifier 

| mod_6 
| float 
| Faction 6 Modifier 

| id_7 
| int 
| Faction 7 Identifier 

| mod_7 
| float 
| Faction 7 Modifier 

| id_8 
| int 
| Faction 8 Identifier 

| mod_8 
| float 
| Faction 8 Modifier 

| id_9 
| int 
| Faction 9 Identifier 

| mod_9 
| float 
| Faction 9 Modifier 

| id_10 
| int 
| Faction 10 Identifier 

| mod_10 
| float 
| Faction 10 Modifier

---

## faction_base_data

*Source: schema/factions/faction_base_data/index.html*

# faction_base_data¶

## Relationships¶

```
erDiagram
 faction_base_data {
 smallint client_faction_id
 }
 faction_list {
 int id
 }
 faction_base_data ||--o{ faction_list : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| client_faction_id 
| faction_list 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| client_faction_id 
| smallint 
| Client Faction Identifier 

| min 
| smallint 
| Minimum Faction 

| max 
| smallint 
| Maximum Faction 

| unk_hero1 
| smallint 
| Unknown 

| unk_hero2 
| smallint 
| Unknown 

| unk_hero3 
| smallint 
| Unknown

---

## faction_list

*Source: schema/factions/faction_list/index.html*

# faction_list¶

## Relationships¶

```
erDiagram
 faction_list {
 int id
 }
 faction_list_mod {
 intunsigned faction_id
 }
 npc_types {
 intunsigned alt_currency_id
 int id
 int npc_faction_id
 text name
 intunsigned loottable_id
 intunsigned merchant_id
 intunsigned emoteid
 intunsigned adventure_template_id
 intunsigned armortint_id
 intunsigned npc_spells_id
 intunsigned npc_spells_effects_id
 intunsigned trap_template
 }
 faction_list ||--o{ faction_list_mod : "Has-Many"
 faction_list ||--o{ npc_types : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| id 
| faction_list_mod 
| faction_id 

| Has-Many 
| id 
| npc_types 
| npc_faction_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Faction Identifier 

| name 
| varchar 
| Name 

| base 
| smallint 
| Base

---

## faction_list_mod

*Source: schema/factions/faction_list_mod/index.html*

# faction_list_mod¶

## Relationships¶

```
erDiagram
 faction_list_mod {
 intunsigned faction_id
 }
 faction_list {
 int id
 }
 faction_list_mod ||--o{ faction_list : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| faction_id 
| faction_list 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Faction List Modifier Identifier 

| faction_id 
| int 
| Faction Identifier 

| mod 
| smallint 
| Modifier 

| mod_name 
| varchar 
| Modifier Name: r# = Race Identifier, c# = Class Identifier, d# = Deity Identifier

---

## faction_values

*Source: schema/factions/faction_values/index.html*

# faction_values¶

## Relationships¶

```
erDiagram
 faction_values {
 int char_id
 int faction_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 faction_list {
 int id
 }
 faction_values ||--o{ character_data : "One-to-One"
 faction_values ||--o{ faction_list : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| char_id 
| character_data 
| id 

| One-to-One 
| faction_id 
| faction_list 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| char_id 
| int 
| Character Identifier 

| faction_id 
| int 
| Faction Identifier 

| current_value 
| smallint 
| Current Value 

| temp 
| tinyint 
| Temporary: 0 = False, 1 = True

---

## content_flags

*Source: schema/flagging/content_flags/index.html*

# content_flags¶

## Relationships¶

```
erDiagram
 content_flags {
 varchar flag_name
 }
 doors {
 varchar content_flags
 varchar content_flags_disabled
 int dz_switch_id
 int keyitem
 varchar zone
 varchar dest_zone
 intunsigned dest_instance
 smallint version
 }
 fishing {
 varchar content_flags
 varchar content_flags_disabled
 int Itemid
 int zoneid
 int npc_id
 }
 forage {
 varchar content_flags
 varchar content_flags_disabled
 int Itemid
 int zoneid
 }
 global_loot {
 varchar content_flags
 varchar content_flags_disabled
 int loottable_id
 mediumtext zone
 }
 ground_spawns {
 varchar content_flags
 varchar content_flags_disabled
 intunsigned item
 smallint version
 intunsigned zoneid
 }
 content_flags ||--o{ doors : "Has-Many"
 content_flags ||--o{ doors : "Has-Many"
 content_flags ||--o{ fishing : "Has-Many"
 content_flags ||--o{ fishing : "Has-Many"
 content_flags ||--o{ forage : "Has-Many"
 content_flags ||--o{ forage : "Has-Many"
 content_flags ||--o{ global_loot : "Has-Many"
 content_flags ||--o{ global_loot : "Has-Many"
 content_flags ||--o{ ground_spawns : "Has-Many"
 content_flags ||--o{ ground_spawns : "Has-Many"

```

```
erDiagram
 content_flags {
 varchar flag_name
 }
 lootdrop {
 varchar content_flags
 varchar content_flags_disabled
 intunsigned id
 }
 loottable {
 varchar content_flags
 varchar content_flags_disabled
 intunsigned id
 }
 merchantlist {
 varchar content_flags
 varchar content_flags_disabled
 varchar bucket_name
 int item
 varchar merchant_id
 int merchantid
 }
 object {
 varchar content_flags
 varchar content_flags_disabled
 int itemid
 int id
 smallint version
 intunsigned zoneid
 }
 spawn2 {
 varchar content_flags
 varchar content_flags_disabled
 int pathgrid
 int id
 int spawngroupID
 smallint version
 varchar zone
 }
 content_flags ||--o{ lootdrop : "Has-Many"
 content_flags ||--o{ lootdrop : "Has-Many"
 content_flags ||--o{ loottable : "Has-Many"
 content_flags ||--o{ loottable : "Has-Many"
 content_flags ||--o{ merchantlist : "Has-Many"
 content_flags ||--o{ merchantlist : "Has-Many"
 content_flags ||--o{ object : "Has-Many"
 content_flags ||--o{ object : "Has-Many"
 content_flags ||--o{ spawn2 : "Has-Many"
 content_flags ||--o{ spawn2 : "Has-Many"

```

```
erDiagram
 content_flags {
 varchar flag_name
 }
 spawnentry {
 varchar content_flags
 varchar content_flags_disabled
 int npcID
 int spawngroupID
 }
 start_zones {
 varchar content_flags
 varchar content_flags_disabled
 int start_zone
 int zone_id
 }
 starting_items {
 varchar content_flags
 varchar content_flags_disabled
 varchar itemid
 varchar zone_id
 varchar zoneid
 }
 tradeskill_recipe {
 int id
 varchar content_flags
 varchar content_flags_disabled
 }
 traps {
 varchar content_flags
 varchar content_flags_disabled
 smallintunsigned version
 varchar zone
 }
 content_flags ||--o{ spawnentry : "Has-Many"
 content_flags ||--o{ spawnentry : "Has-Many"
 content_flags ||--o{ start_zones : "Has-Many"
 content_flags ||--o{ start_zones : "Has-Many"
 content_flags ||--o{ starting_items : "Has-Many"
 content_flags ||--o{ starting_items : "Has-Many"
 content_flags ||--o{ tradeskill_recipe : "Has-Many"
 content_flags ||--o{ tradeskill_recipe : "Has-Many"
 content_flags ||--o{ traps : "Has-Many"
 content_flags ||--o{ traps : "Has-Many"

```

```
erDiagram
 content_flags {
 varchar flag_name
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 zone_points {
 varchar content_flags
 varchar content_flags_disabled
 intunsigned target_instance
 varchar zone
 intunsigned target_zone_id
 int version
 }
 content_flags ||--o{ zone : "Has-Many"
 content_flags ||--o{ zone : "Has-Many"
 content_flags ||--o{ zone_points : "Has-Many"
 content_flags ||--o{ zone_points : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| flag_name 
| doors 
| content_flags 

| Has-Many 
| flag_name 
| doors 
| content_flags_disabled 

| Has-Many 
| flag_name 
| fishing 
| content_flags 

| Has-Many 
| flag_name 
| fishing 
| content_flags_disabled 

| Has-Many 
| flag_name 
| forage 
| content_flags 

| Has-Many 
| flag_name 
| forage 
| content_flags_disabled 

| Has-Many 
| flag_name 
| global_loot 
| content_flags 

| Has-Many 
| flag_name 
| global_loot 
| content_flags_disabled 

| Has-Many 
| flag_name 
| ground_spawns 
| content_flags 

| Has-Many 
| flag_name 
| ground_spawns 
| content_flags_disabled 

| Has-Many 
| flag_name 
| lootdrop 
| content_flags 

| Has-Many 
| flag_name 
| lootdrop 
| content_flags_disabled 

| Has-Many 
| flag_name 
| loottable 
| content_flags 

| Has-Many 
| flag_name 
| loottable 
| content_flags_disabled 

| Has-Many 
| flag_name 
| merchantlist 
| content_flags 

| Has-Many 
| flag_name 
| merchantlist 
| content_flags_disabled 

| Has-Many 
| flag_name 
| object 
| content_flags 

| Has-Many 
| flag_name 
| object 
| content_flags_disabled 

| Has-Many 
| flag_name 
| spawn2 
| content_flags 

| Has-Many 
| flag_name 
| spawn2 
| content_flags_disabled 

| Has-Many 
| flag_name 
| spawnentry 
| content_flags 

| Has-Many 
| flag_name 
| spawnentry 
| content_flags_disabled 

| Has-Many 
| flag_name 
| start_zones 
| content_flags 

| Has-Many 
| flag_name 
| start_zones 
| content_flags_disabled 

| Has-Many 
| flag_name 
| starting_items 
| content_flags 

| Has-Many 
| flag_name 
| starting_items 
| content_flags_disabled 

| Has-Many 
| flag_name 
| tradeskill_recipe 
| content_flags 

| Has-Many 
| flag_name 
| tradeskill_recipe 
| content_flags_disabled 

| Has-Many 
| flag_name 
| traps 
| content_flags 

| Has-Many 
| flag_name 
| traps 
| content_flags_disabled 

| Has-Many 
| flag_name 
| zone 
| content_flags 

| Has-Many 
| flag_name 
| zone 
| content_flags_disabled 

| Has-Many 
| flag_name 
| zone_points 
| content_flags 

| Has-Many 
| flag_name 
| zone_points 
| content_flags_disabled 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Flag Identifier 

| flag_name 
| varchar 
| Flag Name 

| enabled 
| tinyint 
| Enabled: 0 = False, 1 = True 

| notes 
| text 
| Notes

---

## graveyard

*Source: schema/graveyards/graveyard/index.html*

# graveyard¶

## Relationships¶

```
erDiagram
 graveyard {
 int zone_id
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 graveyard ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| zone_id 
| zone 
| zoneidnumber 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Graveyard Identifier 

| zone_id 
| int 
| Zone Identifier 

| x 
| float 
| X Coordinate 

| y 
| float 
| Y Coordinate 

| z 
| float 
| Z Coordinate 

| heading 
| float 
| Heading Coordinate

---

## grid

*Source: schema/grids/grid/index.html*

# grid¶

## Relationships¶

```
erDiagram
 grid {
 int id
 int zoneid
 }
 grid_entries {
 int gridid
 varchar grid_id
 int zoneid
 }
 spawn2 {
 varchar content_flags
 varchar content_flags_disabled
 int pathgrid
 int id
 int spawngroupID
 smallint version
 varchar zone
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 grid ||--o{ grid_entries : "Has-Many"
 grid ||--o{ spawn2 : "Has-Many"
 grid ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| id 
| grid_entries 
| gridid 

| Has-Many 
| id 
| spawn2 
| pathgrid 

| One-to-One 
| zoneid 
| zone 
| zoneidnumber 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Grid Identifier 

| zoneid 
| int 
| Zone Identifier 

| type 
| int 
| Wander Type 

| type2 
| int 
| Pause Type

---

## grid_entries

*Source: schema/grids/grid_entries/index.html*

# grid_entries¶

## Relationships¶

```
erDiagram
 grid_entries {
 int gridid
 varchar grid_id
 int zoneid
 }
 grid {
 int id
 int zoneid
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 grid_entries ||--o{ grid : "One-to-One"
 grid_entries ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| grid_id 
| grid 
| id 

| One-to-One 
| zoneid 
| zone 
| zoneidnumber 

## Schema¶

| 

Column 
| Data Type 
| Description 

| gridid 
| int 
| Grid Identifier 

| zoneid 
| int 
| Zone Identifier 

| number 
| int 
| Waypoint Identifier 

| x 
| float 
| X Coordinate 

| y 
| float 
| Y Coordinate 

| z 
| float 
| Z Coordinate 

| heading 
| float 
| Heading Coordinate 

| pause 
| int 
| Pause in Seconds 

| centerpoint 
| tinyint 
| Center Point: 0 = False, 1 = True

---

## ground_spawns

*Source: schema/ground-spawns/ground_spawns/index.html*

# ground_spawns¶

## Relationships¶

```
erDiagram
 ground_spawns {
 varchar content_flags
 varchar content_flags_disabled
 intunsigned item
 smallint version
 intunsigned zoneid
 }
 content_flags {
 varchar flag_name
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 ground_spawns ||--o{ content_flags : "One-to-One"
 ground_spawns ||--o{ content_flags : "One-to-One"
 ground_spawns ||--o{ items : "One-to-One"
 ground_spawns ||--o{ zone : "One-to-One"
 ground_spawns ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| content_flags 
| content_flags 
| flag_name 

| One-to-One 
| content_flags_disabled 
| content_flags 
| flag_name 

| One-to-One 
| item 
| items 
| id 

| One-to-One 
| version 
| zone 
| version 

| One-to-One 
| zoneid 
| zone 
| zoneidnumber 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Ground Spawn Identifier 

| zoneid 
| int 
| Zone Identifier 

| version 
| smallint 
| Version: -1 For All 

| max_x 
| float 
| Maximum X Coordinate 

| max_y 
| float 
| Maximum Y Coordinate 

| max_z 
| float 
| Maximum Z Coordinate 

| min_x 
| float 
| Minimum X Coordinate 

| min_y 
| float 
| Minimum Y Coordinate 

| heading 
| float 
| Heading Coordinate 

| name 
| varchar 
| Name 

| item 
| int 
| Item Identifier 

| max_allowed 
| int 
| Max Allowed 

| comment 
| varchar 
| Comment 

| respawn_timer 
| int 
| Respawn Timer in Seconds 

| fix_z 
| tinyint 
| 

| min_expansion 
| tinyint 
| Minimum Expansion 

| max_expansion 
| tinyint 
| Maximum Expansion 

| content_flags 
| varchar 
| Content Flags Required to be Enabled 

| content_flags_disabled 
| varchar 
| Content Flags Required to be Disabled

---

## group_id

*Source: schema/groups/group_id/index.html*

# group_id¶

## Relationships¶

```
erDiagram
 group_id {
 int charid
 int groupid
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 group_leaders {
 varchar assist
 varchar leadername
 varchar maintank
 varchar mentoree
 varchar puller
 int gid
 }
 group_id ||--o{ character_data : "One-to-One"
 group_id ||--o{ group_leaders : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| charid 
| character_data 
| id 

| One-to-One 
| groupid 
| group_leaders 
| gid 

## Schema¶

| 

Column 
| Data Type 
| Description 

| groupid 
| int 
| Unique Group Identifier 

| charid 
| int 
| Character Identifier 

| name 
| varchar 
| Name 

| ismerc 
| tinyint 
| Is Mercenary: 0 = False, 1 = True

---

## group_leaders

*Source: schema/groups/group_leaders/index.html*

# group_leaders¶

## Relationships¶

```
erDiagram
 group_leaders {
 varchar assist
 varchar leadername
 varchar maintank
 varchar mentoree
 varchar puller
 int gid
 }
 group_id {
 int charid
 int groupid
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 group_leaders ||--o{ group_id : "Has-Many"
 group_leaders ||--o{ character_data : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| gid 
| group_id 
| groupid 

| One-to-One 
| leadername 
| character_data 
| name 

## Schema¶

| 

Column 
| Data Type 
| Description 

| gid 
| int 
| Group Identifier 

| leadername 
| varchar 
| Leader Name 

| marknpc 
| varchar 
| Mark NPC: 0 = False, 1 = True 

| leadershipaa 
| tinyblob 
| Leadership AA 

| maintank 
| varchar 
| Main Tank: 0 = False, 1 = True 

| assist 
| varchar 
| Assist: 0 = False, 1 = True 

| puller 
| varchar 
| Puller: 0 = False, 1 = True 

| mentoree 
| varchar 
| Mentoree: 0 = False, 1 = True 

| mentor_percent 
| int 
| Main Tank: 0 = None, 100 = Max

---

## guild_bank

*Source: schema/guilds/guild_bank/index.html*

# guild_bank¶

## Relationships¶

```
erDiagram
 guild_bank {
 varchar donator
 intunsigned guildid
 intunsigned itemid
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 guilds {
 int id
 int leader
 varchar motd_setter
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 guild_bank ||--o{ character_data : "One-to-One"
 guild_bank ||--o{ guilds : "One-to-One"
 guild_bank ||--o{ items : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| donator 
| character_data 
| name 

| One-to-One 
| guildid 
| guilds 
| id 

| One-to-One 
| itemid 
| items 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| guildid 
| int 
| Guild Identifier 

| area 
| tinyint 
| Area 

| slot 
| int 
| Slot Identifier 

| itemid 
| int 
| Item Identifier 

| qty 
| int 
| Quantity 

| donator 
| varchar 
| Character Identifier 

| permissions 
| tinyint 
| Permissions 

| whofor 
| varchar 
| Who For

---

## guild_members

*Source: schema/guilds/guild_members/index.html*

# guild_members¶

## Relationships¶

```
erDiagram
 guild_members {
 int char_id
 mediumintunsigned guild_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 guilds {
 int id
 int leader
 varchar motd_setter
 }
 guild_members ||--o{ character_data : "One-to-One"
 guild_members ||--o{ guilds : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| char_id 
| character_data 
| id 

| One-to-One 
| guild_id 
| guilds 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| char_id 
| int 
| Character Identifier 

| guild_id 
| mediumint 
| Guild Identifier 

| rank 
| tinyint 
| Rank 

| tribute_enable 
| tinyint 
| Tribute Enable: 0 = False, 1 = True 

| total_tribute 
| int 
| Total Tribute 

| last_tribute 
| int 
| Last Tribute 

| banker 
| tinyint 
| Banked: 0 = False, 1 = True 

| public_note 
| text 
| Public Note 

| alt 
| tinyint 
| Alt: 0 = False, 1 = True 

| online 
| tinyint 
|

---

## guild_ranks

*Source: schema/guilds/guild_ranks/index.html*

# guild_ranks¶

## Relationships¶

```
erDiagram
 guild_ranks {
 mediumintunsigned guild_id
 }
 guilds {
 int id
 int leader
 varchar motd_setter
 }
 guild_ranks ||--o{ guilds : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| guild_id 
| guilds 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| guild_id 
| mediumint 
| Guild Identifier 

| rank 
| tinyint 
| Rank Identifier 

| title 
| varchar 
| Title 

| can_hear 
| tinyint 
| Can Hear: 0 = False, 1 = True 

| can_speak 
| tinyint 
| Can Speak: 0 = False, 1 = True 

| can_invite 
| tinyint 
| Can Invite: 0 = False, 1 = True 

| can_remove 
| tinyint 
| Can Remove: 0 = False, 1 = True 

| can_promote 
| tinyint 
| Can Promote: 0 = False, 1 = True 

| can_demote 
| tinyint 
| Can Demote: 0 = False, 1 = True 

| can_motd 
| tinyint 
| Can MOTD: 0 = False, 1 = True 

| can_warpeace 
| tinyint 
| Can War Peace: 0 = False, 1 = True

---

## guild_relations

*Source: schema/guilds/guild_relations/index.html*

# guild_relations¶

## Relationships¶

```
erDiagram
 guild_relations {
 mediumintunsigned guild1
 mediumintunsigned guild2
 }
 guilds {
 int id
 int leader
 varchar motd_setter
 }
 guild_relations ||--o{ guilds : "One-to-One"
 guild_relations ||--o{ guilds : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| guild1 
| guilds 
| id 

| One-to-One 
| guild2 
| guilds 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| guild1 
| mediumint 
| Unique Guild Identifier 1 

| guild2 
| mediumint 
| Unique Guild Identifier 2 

| relation 
| tinyint 
| Relation

---

## guilds

*Source: schema/guilds/guilds/index.html*

# guilds¶

## Relationships¶

```
erDiagram
 guilds {
 int id
 int leader
 varchar motd_setter
 }
 guild_bank {
 varchar donator
 intunsigned guildid
 intunsigned itemid
 }
 guild_ranks {
 mediumintunsigned guild_id
 }
 guild_members {
 int char_id
 mediumintunsigned guild_id
 }
 guild_relations {
 mediumintunsigned guild1
 mediumintunsigned guild2
 }
 qs_player_speech {
 varchar from
 varchar to
 int guilddbid
 }
 guilds ||--o{ guild_bank : "Has-Many"
 guilds ||--o{ guild_ranks : "Has-Many"
 guilds ||--o{ guild_members : "Has-Many"
 guilds ||--o{ guild_relations : "Has-Many"
 guilds ||--o{ guild_relations : "Has-Many"
 guilds ||--o{ qs_player_speech : "Has-Many"

```

```
erDiagram
 guilds {
 int id
 int leader
 varchar motd_setter
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 guilds ||--o{ character_data : "One-to-One"
 guilds ||--o{ character_data : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| id 
| guild_bank 
| guildid 

| Has-Many 
| id 
| guild_ranks 
| guild_id 

| Has-Many 
| id 
| guild_members 
| guild_id 

| Has-Many 
| id 
| guild_relations 
| guild1 

| Has-Many 
| id 
| guild_relations 
| guild2 

| Has-Many 
| id 
| qs_player_speech 
| guilddbid 

| One-to-One 
| leader 
| character_data 
| id 

| One-to-One 
| motd_setter 
| character_data 
| name 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Guild Identifier 

| name 
| varchar 
| Name 

| leader 
| int 
| Character Identifier 

| minstatus 
| smallint 
| Minimum Status 

| motd 
| text 
| Message of the Day 

| tribute 
| int 
| Tribute 

| motd_setter 
| varchar 
| Character Identifier 

| channel 
| varchar 
| Channel 

| url 
| varchar 
| Website URL 

| favor 
| int 
|

---

## horses

*Source: schema/horses/horses/index.html*

# horses¶

## Relationships¶

```
erDiagram
 horses {
 varchar filename
 }
 npc_types {
 intunsigned alt_currency_id
 int id
 int npc_faction_id
 text name
 intunsigned loottable_id
 intunsigned merchant_id
 intunsigned emoteid
 intunsigned adventure_template_id
 intunsigned armortint_id
 intunsigned npc_spells_id
 intunsigned npc_spells_effects_id
 intunsigned trap_template
 }
 horses ||--o{ npc_types : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| filename 
| npc_types 
| name 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Horse Identifier 

| filename 
| varchar 
| NPC Type Name 

| race 
| smallint 
| Race 

| gender 
| tinyint 
| Gender 

| texture 
| tinyint 
| Texture 

| mountspeed 
| float 
| Mount Run Speed 

| notes 
| varchar 
| Notes

---

## instance_list

*Source: schema/instances/instance_list/index.html*

# instance_list¶

## Relationships¶

```
erDiagram
 instance_list {
 int id
 tinyintunsigned version
 intunsigned zone
 }
 adventure_details {
 intunsigned id
 smallintunsigned adventure_id
 int instance_id
 }
 character_bind {
 intunsigned id
 smallintunsigned zone_id
 mediumintunsigned instance_id
 }
 character_corpses {
 intunsigned id
 intunsigned charid
 varchar charname
 smallintunsigned instance_id
 smallint zone_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 character_instance_safereturns {
 intunsigned character_id
 int instance_zone_id
 int instance_id
 int safe_zone_id
 }
 instance_list ||--o{ adventure_details : "Has-Many"
 instance_list ||--o{ character_bind : "Has-Many"
 instance_list ||--o{ character_corpses : "Has-Many"
 instance_list ||--o{ character_data : "Has-Many"
 instance_list ||--o{ character_instance_safereturns : "Has-Many"
 instance_list ||--o{ character_instance_safereturns : "Has-Many"

```

```
erDiagram
 instance_list {
 int id
 tinyintunsigned version
 intunsigned zone
 }
 doors {
 varchar content_flags
 varchar content_flags_disabled
 int dz_switch_id
 int keyitem
 varchar zone
 varchar dest_zone
 intunsigned dest_instance
 smallint version
 }
 dynamic_zones {
 int dz_switch_id
 intunsigned id
 intunsigned compass_zone_id
 int instance_id
 intunsigned safe_return_zone_id
 }
 respawn_times {
 smallint instance_id
 int id
 }
 spawn_condition_values {
 intunsigned instance_id
 intunsigned id
 varchar zone
 }
 zone_points {
 varchar content_flags
 varchar content_flags_disabled
 intunsigned target_instance
 varchar zone
 intunsigned target_zone_id
 int version
 }
 instance_list ||--o{ doors : "Has-Many"
 instance_list ||--o{ dynamic_zones : "Has-Many"
 instance_list ||--o{ respawn_times : "Has-Many"
 instance_list ||--o{ spawn_condition_values : "Has-Many"
 instance_list ||--o{ zone_points : "Has-Many"

```

```
erDiagram
 instance_list {
 int id
 tinyintunsigned version
 intunsigned zone
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 instance_list ||--o{ zone : "One-to-One"
 instance_list ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| id 
| adventure_details 
| instance_id 

| Has-Many 
| id 
| character_bind 
| instance_id 

| Has-Many 
| id 
| character_corpses 
| instance_id 

| Has-Many 
| id 
| character_data 
| zone_instance 

| Has-Many 
| id 
| character_instance_safereturns 
| instance_id 

| Has-Many 
| id 
| character_instance_safereturns 
| instance_zone_id 

| Has-Many 
| id 
| doors 
| dest_instance 

| Has-Many 
| id 
| dynamic_zones 
| instance_id 

| Has-Many 
| id 
| respawn_times 
| instance_id 

| Has-Many 
| id 
| spawn_condition_values 
| instance_id 

| Has-Many 
| id 
| zone_points 
| target_instance 

| One-to-One 
| version 
| zone 
| version 

| One-to-One 
| zone 
| zone 
| zoneidnumber 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Instance Identifier 

| zone 
| int 
| Zone Identifier 

| version 
| tinyint 
| Version 

| is_global 
| tinyint 
| Is Global: 0 = False, 1 = True 

| start_time 
| int 
| Start Time UNIX Timestamp 

| duration 
| int 
| Duration in Seconds 

| never_expires 
| tinyint 
| Never Expires: 0 = False, 1 = True 

| notes 
| varchar 
|

---

## instance_list_player

*Source: schema/instances/instance_list_player/index.html*

# instance_list_player¶

## Relationships¶

```
erDiagram
 instance_list_player {
 intunsigned charid
 intunsigned id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 instance_list {
 int id
 tinyintunsigned version
 intunsigned zone
 }
 instance_list_player ||--o{ character_data : "One-to-One"
 instance_list_player ||--o{ instance_list : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| charid 
| character_data 
| id 

| One-to-One 
| id 
| instance_list 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Instance Identifier 

| charid 
| int 
| Character Identifier

---

## inventory

*Source: schema/inventory/inventory/index.html*

# inventory¶

## Relationships¶

```
erDiagram
 inventory {
 intunsigned charid
 intunsigned itemid
 mediumintunsigned augslot1
 mediumintunsigned augslot2
 mediumintunsigned augslot3
 mediumintunsigned augslot4
 mediumintunsigned augslot5
 mediumint augslot6
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 inventory ||--o{ character_data : "One-to-One"
 inventory ||--o{ items : "One-to-One"
 inventory ||--o{ items : "One-to-One"
 inventory ||--o{ items : "One-to-One"
 inventory ||--o{ items : "One-to-One"
 inventory ||--o{ items : "One-to-One"
 inventory ||--o{ items : "One-to-One"
 inventory ||--o{ items : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| charid 
| character_data 
| id 

| One-to-One 
| itemid 
| items 
| id 

| One-to-One 
| augslot1 
| items 
| id 

| One-to-One 
| augslot2 
| items 
| id 

| One-to-One 
| augslot3 
| items 
| id 

| One-to-One 
| augslot4 
| items 
| id 

| One-to-One 
| augslot5 
| items 
| id 

| One-to-One 
| augslot6 
| items 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| charid 
| int 
| Character Identifier 

| slotid 
| mediumint 
| Slot Identifier 

| itemid 
| int 
| Item Identifier 

| charges 
| smallint 
| Charges 

| color 
| int 
| Color 

| augslot1 
| mediumint 
| Augment Slot 1 

| augslot2 
| mediumint 
| Augment Slot 2 

| augslot3 
| mediumint 
| Augment Slot 3 

| augslot4 
| mediumint 
| Augment Slot 4 

| augslot5 
| mediumint 
| Augment Slot 5 

| augslot6 
| mediumint 
| Augment Slot 6 

| instnodrop 
| tinyint 
| No Drop: 0 = True, 1 = False 

| custom_data 
| text 
| Custom Data 

| ornamenticon 
| int 
| Ornamentation Icon 

| ornamentidfile 
| int 
| Ornamentation Texture 

| ornament_hero_model 
| int 
| Ornamentation Hero's Forge Model

---

## inventory_snapshots

*Source: schema/inventory/inventory_snapshots/index.html*

# inventory_snapshots¶

## Relationships¶

```
erDiagram
 inventory_snapshots {
 intunsigned charid
 intunsigned itemid
 mediumintunsigned augslot1
 mediumintunsigned augslot2
 mediumintunsigned augslot3
 mediumintunsigned augslot4
 mediumintunsigned augslot5
 mediumint augslot6
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 inventory_snapshots ||--o{ character_data : "One-to-One"
 inventory_snapshots ||--o{ items : "One-to-One"
 inventory_snapshots ||--o{ items : "One-to-One"
 inventory_snapshots ||--o{ items : "One-to-One"
 inventory_snapshots ||--o{ items : "One-to-One"
 inventory_snapshots ||--o{ items : "One-to-One"
 inventory_snapshots ||--o{ items : "One-to-One"
 inventory_snapshots ||--o{ items : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| charid 
| character_data 
| id 

| One-to-One 
| itemid 
| items 
| id 

| One-to-One 
| augslot1 
| items 
| id 

| One-to-One 
| augslot2 
| items 
| id 

| One-to-One 
| augslot3 
| items 
| id 

| One-to-One 
| augslot4 
| items 
| id 

| One-to-One 
| augslot5 
| items 
| id 

| One-to-One 
| augslot6 
| items 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| time_index 
| int 
| Inventory Snapshot Time Identifier 

| charid 
| int 
| Character Identifier 

| slotid 
| mediumint 
| Slot Identifier 

| itemid 
| int 
| Item Identifier 

| charges 
| smallint 
| Charges 

| color 
| int 
| Color 

| augslot1 
| mediumint 
| Augment Slot 1 

| augslot2 
| mediumint 
| Augment Slot 2 

| augslot3 
| mediumint 
| Augment Slot 3 

| augslot4 
| mediumint 
| Augment Slot 4 

| augslot5 
| mediumint 
| Augment Slot 5 

| augslot6 
| mediumint 
| Augment Slot 6 

| instnodrop 
| tinyint 
| No Drop: 0 = False, 1 = True 

| custom_data 
| text 
| Custom Data 

| ornamenticon 
| int 
| Ornamentation Icon 

| ornamentidfile 
| int 
| Ornamentation Texture 

| ornament_hero_model 
| int 
| Ornamentation Hero's Forge Model

---

## inventory_versions

*Source: schema/inventory/inventory_versions/index.html*

# inventory_versions¶

## Schema¶

| 

Column 
| Data Type 
| Description 

| version 
| int 
| Inventory Version Identifier 

| step 
| int 
| Step 

| bot_step 
| int 
| Bot Step

---

## item_tick

*Source: schema/items/item_tick/index.html*

# item_tick¶

## Relationships¶

```
erDiagram
 item_tick {
 varchar it_itemid
 varchar it_qglobal
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 quest_globals {
 int charid
 varchar name
 int npcid
 int zoneid
 }
 item_tick ||--o{ items : "One-to-One"
 item_tick ||--o{ quest_globals : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| it_itemid 
| items 
| id 

| Has-Many 
| it_qglobal 
| quest_globals 
| name 

## Schema¶

| 

Column 
| Data Type 
| Description 

| it_itemid 
| int 
| Item Identifier 

| it_chance 
| int 
| Chance: 0 = Never, 100 = Always 

| it_level 
| int 
| Level 

| it_id 
| int 
| Spell Identifier 

| it_qglobal 
| varchar 
| Quest Global Identifier (Deprecated) 

| it_bagslot 
| tinyint 
| Bag Slot

---

## items

*Source: schema/items/items/index.html*

# items¶

## Relationships¶

```
erDiagram
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 spells_new {
 int id
 int descnum
 int effectdescnum
 int effectdescnum2
 int typedescnum
 varchar teleport_zone
 }
 books {
 int id
 }
 alternate_currency {
 int id
 int item_id
 }
 bot_inventories {
 varchar bot_id
 varchar item_id
 varchar augment_1
 varchar augment_2
 varchar augment_3
 varchar augment_4
 varchar augment_5
 varchar augment_6
 }
 bot_pet_inventories {
 varchar pets_index
 varchar item_id
 }
 items ||--o{ spells_new : "One-to-One"
 items ||--o{ books : "One-to-One"
 items ||--o{ spells_new : "One-to-One"
 items ||--o{ spells_new : "One-to-One"
 items ||--o{ alternate_currency : "Has-Many"
 items ||--o{ bot_inventories : "Has-Many"
 items ||--o{ bot_inventories : "Has-Many"
 items ||--o{ bot_inventories : "Has-Many"
 items ||--o{ bot_inventories : "Has-Many"
 items ||--o{ bot_inventories : "Has-Many"
 items ||--o{ bot_inventories : "Has-Many"
 items ||--o{ bot_inventories : "Has-Many"
 items ||--o{ bot_pet_inventories : "Has-Many"
 items ||--o{ spells_new : "One-to-One"
 items ||--o{ spells_new : "One-to-One"
 items ||--o{ spells_new : "One-to-One"

```

```
erDiagram
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 character_bandolier {
 intunsigned id
 intunsigned item_id
 }
 character_corpse_items {
 intunsigned corpse_id
 intunsigned item_id
 intunsigned aug_1
 intunsigned aug_2
 intunsigned aug_3
 intunsigned aug_4
 intunsigned aug_5
 int aug_6
 }
 character_pet_inventory {
 int char_id
 int item_id
 }
 character_potionbelt {
 intunsigned id
 intunsigned icon
 intunsigned item_id
 }
 discovered_items {
 varchar char_name
 intunsigned item_id
 }
 items ||--o{ character_bandolier : "Has-Many"
 items ||--o{ character_corpse_items : "Has-Many"
 items ||--o{ character_pet_inventory : "Has-Many"
 items ||--o{ character_potionbelt : "Has-Many"
 items ||--o{ discovered_items : "Has-Many"

```

```
erDiagram
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 doors {
 varchar content_flags
 varchar content_flags_disabled
 int dz_switch_id
 int keyitem
 varchar zone
 varchar dest_zone
 intunsigned dest_instance
 smallint version
 }
 fishing {
 varchar content_flags
 varchar content_flags_disabled
 int Itemid
 int zoneid
 int npc_id
 }
 forage {
 varchar content_flags
 varchar content_flags_disabled
 int Itemid
 int zoneid
 }
 ground_spawns {
 varchar content_flags
 varchar content_flags_disabled
 intunsigned item
 smallint version
 intunsigned zoneid
 }
 inventory {
 intunsigned charid
 intunsigned itemid
 mediumintunsigned augslot1
 mediumintunsigned augslot2
 mediumintunsigned augslot3
 mediumintunsigned augslot4
 mediumintunsigned augslot5
 mediumint augslot6
 }
 items ||--o{ doors : "Has-Many"
 items ||--o{ fishing : "Has-Many"
 items ||--o{ forage : "Has-Many"
 items ||--o{ ground_spawns : "Has-Many"
 items ||--o{ inventory : "Has-Many"

```

```
erDiagram
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 item_tick {
 varchar it_itemid
 varchar it_qglobal
 }
 keyring {
 int char_id
 int item_id
 }
 lootdrop_entries {
 int item_id
 intunsigned lootdrop_id
 }
 merc_inventory {
 varchar item_id
 varchar merc_subtype_id
 }
 merchantlist {
 varchar content_flags
 varchar content_flags_disabled
 varchar bucket_name
 int item
 varchar merchant_id
 int merchantid
 }
 items ||--o{ item_tick : "Has-Many"
 items ||--o{ keyring : "Has-Many"
 items ||--o{ lootdrop_entries : "Has-Many"
 items ||--o{ merc_inventory : "Has-Many"
 items ||--o{ merchantlist : "Has-Many"

```

```
erDiagram
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 merchantlist_temp {
 intunsigned itemid
 intunsigned npcid
 }
 object {
 varchar content_flags
 varchar content_flags_disabled
 int itemid
 int id
 smallint version
 intunsigned zoneid
 }
 object_contents {
 intunsigned itemid
 intunsigned parentid
 mediumintunsigned augslot1
 mediumintunsigned augslot2
 mediumintunsigned augslot3
 mediumintunsigned augslot4
 mediumintunsigned augslot5
 mediumint augslot6
 intunsigned zoneid
 }
 pets_equipmentset_entries {
 int item_id
 int set_id
 }
 qs_merchant_transaction_record_entries {
 int item_id
 int aug_1
 int aug_2
 int aug_3
 int aug_4
 int aug_5
 }
 items ||--o{ merchantlist_temp : "Has-Many"
 items ||--o{ object : "Has-Many"
 items ||--o{ object_contents : "Has-Many"
 items ||--o{ pets_equipmentset_entries : "Has-Many"
 items ||--o{ qs_merchant_transaction_record_entries : "Has-Many"

```

```
erDiagram
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 qs_player_delete_record_entries {
 int item_id
 int aug_1
 int aug_2
 int aug_3
 int aug_4
 int aug_5
 }
 qs_player_handin_record_entries {
 int item_id
 int aug_1
 int aug_2
 int aug_3
 int aug_4
 int aug_5
 }
 qs_player_move_record_entries {
 int item_id
 int aug_1
 int aug_2
 int aug_3
 int aug_4
 int aug_5
 }
 qs_player_trade_record_entries {
 int from_id
 int to_id
 int item_id
 int aug_1
 int aug_2
 int aug_3
 int aug_4
 int aug_5
 }
 starting_items {
 varchar content_flags
 varchar content_flags_disabled
 varchar itemid
 varchar zone_id
 varchar zoneid
 }
 items ||--o{ qs_player_delete_record_entries : "Has-Many"
 items ||--o{ qs_player_delete_record_entries : "Has-Many"
 items ||--o{ qs_player_delete_record_entries : "Has-Many"
 items ||--o{ qs_player_delete_record_entries : "Has-Many"
 items ||--o{ qs_player_delete_record_entries : "Has-Many"
 items ||--o{ qs_player_delete_record_entries : "Has-Many"
 items ||--o{ qs_player_handin_record_entries : "Has-Many"
 items ||--o{ qs_player_handin_record_entries : "Has-Many"
 items ||--o{ qs_player_handin_record_entries : "Has-Many"
 items ||--o{ qs_player_handin_record_entries : "Has-Many"
 items ||--o{ qs_player_handin_record_entries : "Has-Many"
 items ||--o{ qs_player_handin_record_entries : "Has-Many"
 items ||--o{ qs_player_move_record_entries : "Has-Many"
 items ||--o{ qs_player_move_record_entries : "Has-Many"
 items ||--o{ qs_player_move_record_entries : "Has-Many"
 items ||--o{ qs_player_move_record_entries : "Has-Many"
 items ||--o{ qs_player_move_record_entries : "Has-Many"
 items ||--o{ qs_player_move_record_entries : "Has-Many"
 items ||--o{ qs_player_trade_record_entries : "Has-Many"
 items ||--o{ qs_player_trade_record_entries : "Has-Many"
 items ||--o{ qs_player_trade_record_entries : "Has-Many"
 items ||--o{ qs_player_trade_record_entries : "Has-Many"
 items ||--o{ qs_player_trade_record_entries : "Has-Many"
 items ||--o{ qs_player_trade_record_entries : "Has-Many"
 items ||--o{ starting_items : "Has-Many"

```

```
erDiagram
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 tool_gearup_armor_sets {
 int item_id
 }
 trader {
 intunsigned char_id
 intunsigned item_id
 }
 tradeskill_recipe_entries {
 int item_id
 int recipe_id
 }
 tribute_levels {
 intunsigned item_id
 intunsigned tribute_id
 }
 veteran_reward_templates {
 intunsigned claim_id
 intunsigned item_id
 }
 items ||--o{ tool_gearup_armor_sets : "Has-Many"
 items ||--o{ trader : "Has-Many"
 items ||--o{ tradeskill_recipe_entries : "Has-Many"
 items ||--o{ tribute_levels : "Has-Many"
 items ||--o{ veteran_reward_templates : "Has-Many"

```

```
erDiagram
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 trader_audit {
 varchar buyer
 varchar seller
 varchar itemname
 }
 character_item_recast {
 intunsigned id
 intunsigned recast_type
 }
 items ||--o{ trader_audit : "Has-Many"
 items ||--o{ character_item_recast : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| bardeffect 
| spells_new 
| id 

| One-to-One 
| book 
| books 
| id 

| One-to-One 
| clickeffect 
| spells_new 
| id 

| One-to-One 
| focuseffect 
| spells_new 
| id 

| Has-Many 
| id 
| alternate_currency 
| item_id 

| Has-Many 
| id 
| bot_inventories 
| item_id 

| Has-Many 
| id 
| bot_inventories 
| augment_1 

| Has-Many 
| id 
| bot_inventories 
| augment_2 

| Has-Many 
| id 
| bot_inventories 
| augment_3 

| Has-Many 
| id 
| bot_inventories 
| augment_4 

| Has-Many 
| id 
| bot_inventories 
| augment_5 

| Has-Many 
| id 
| bot_inventories 
| augment_6 

| Has-Many 
| id 
| bot_pet_inventories 
| item_id 

| Has-Many 
| id 
| character_bandolier 
| item_id 

| Has-Many 
| id 
| character_corpse_items 
| item_id 

| Has-Many 
| id 
| character_pet_inventory 
| item_id 

| Has-Many 
| id 
| character_potionbelt 
| item_id 

| Has-Many 
| id 
| discovered_items 
| item_id 

| Has-Many 
| id 
| doors 
| keyitem 

| Has-Many 
| id 
| fishing 
| Itemid 

| Has-Many 
| id 
| forage 
| Itemid 

| Has-Many 
| id 
| ground_spawns 
| item 

| Has-Many 
| id 
| inventory 
| itemid 

| Has-Many 
| id 
| item_tick 
| it_itemid 

| Has-Many 
| id 
| keyring 
| item_id 

| Has-Many 
| id 
| lootdrop_entries 
| item_id 

| Has-Many 
| id 
| merc_inventory 
| item_id 

| Has-Many 
| id 
| merchantlist 
| item 

| Has-Many 
| id 
| merchantlist_temp 
| itemid 

| Has-Many 
| id 
| object 
| itemid 

| Has-Many 
| id 
| object_contents 
| itemid 

| Has-Many 
| id 
| pets_equipmentset_entries 
| item_id 

| Has-Many 
| id 
| qs_merchant_transaction_record_entries 
| item_id 

| Has-Many 
| id 
| qs_player_delete_record_entries 
| item_id 

| Has-Many 
| id 
| qs_player_delete_record_entries 
| aug_1 

| Has-Many 
| id 
| qs_player_delete_record_entries 
| aug_2 

| Has-Many 
| id 
| qs_player_delete_record_entries 
| aug_3 

| Has-Many 
| id 
| qs_player_delete_record_entries 
| aug_4 

| Has-Many 
| id 
| qs_player_delete_record_entries 
| aug_5 

| Has-Many 
| id 
| qs_player_handin_record_entries 
| item_id 

| Has-Many 
| id 
| qs_player_handin_record_entries 
| aug_1 

| Has-Many 
| id 
| qs_player_handin_record_entries 
| aug_2 

| Has-Many 
| id 
| qs_player_handin_record_entries 
| aug_3 

| Has-Many 
| id 
| qs_player_handin_record_entries 
| aug_4 

| Has-Many 
| id 
| qs_player_handin_record_entries 
| aug_5 

| Has-Many 
| id 
| qs_player_move_record_entries 
| item_id 

| Has-Many 
| id 
| qs_player_move_record_entries 
| aug_1 

| Has-Many 
| id 
| qs_player_move_record_entries 
| aug_2 

| Has-Many 
| id 
| qs_player_move_record_entries 
| aug_3 

| Has-Many 
| id 
| qs_player_move_record_entries 
| aug_4 

| Has-Many 
| id 
| qs_player_move_record_entries 
| aug_5 

| Has-Many 
| id 
| qs_player_trade_record_entries 
| item_id 

| Has-Many 
| id 
| qs_player_trade_record_entries 
| aug_1 

| Has-Many 
| id 
| qs_player_trade_record_entries 
| aug_2 

| Has-Many 
| id 
| qs_player_trade_record_entries 
| aug_3 

| Has-Many 
| id 
| qs_player_trade_record_entries 
| aug_4 

| Has-Many 
| id 
| qs_player_trade_record_entries 
| aug_5 

| Has-Many 
| id 
| starting_items 
| itemid 

| Has-Many 
| id 
| tool_gearup_armor_sets 
| item_id 

| Has-Many 
| id 
| trader 
| item_id 

| Has-Many 
| id 
| tradeskill_recipe_entries 
| item_id 

| Has-Many 
| id 
| tribute_levels 
| item_id 

| Has-Many 
| id 
| veteran_reward_templates 
| item_id 

| Has-Many 
| name 
| trader_audit 
| itemname 

| One-to-One 
| proceffect 
| spells_new 
| id 

| Has-Many 
| recasttype 
| character_item_recast 
| recast_type 

| One-to-One 
| scrolleffect 
| spells_new 
| id 

| One-to-One 
| worneffect 
| spells_new 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Item Identifier 

| minstatus 
| smallint 
| Minimum Status 

| Name 
| varchar 
| Name 

| aagi 
| int 
| Agility: -128 to 127 

| ac 
| int 
| Armor Class 

| accuracy 
| int 
| Accuracy 

| acha 
| int 
| Charisma: -128 to 127 

| adex 
| int 
| Dexterity: -128 to 127 

| aint 
| int 
| Intelligence: -128 to 127 

| artifactflag 
| tinyint 
| Artifact: 0 = False, 1 = True 

| asta 
| int 
| Stamina: -128 to 127 

| astr 
| int 
| Strenght: -128 to 127 

| attack 
| int 
| Attack 

| augrestrict 
| int 
| Augment Restriction 

| augslot1type 
| tinyint 
| Augment Slot 1 Type 

| augslot1visible 
| tinyint 
| Augment Slot 1 Visible: 0 = False, 1 = True 

| augslot2type 
| tinyint 
| Augment Slot 2 Type 

| augslot2visible 
| tinyint 
| Augment Slot 2 Visible: 0 = False, 1 = True 

| augslot3type 
| tinyint 
| Augment Slot 3 Type 

| augslot3visible 
| tinyint 
| Augment Slot 3 Visible: 0 = False, 1 = True 

| augslot4type 
| tinyint 
| Augment Slot 4 Type 

| augslot4visible 
| tinyint 
| Augment Slot 4 Visible: 0 = False, 1 = True 

| augslot5type 
| tinyint 
| Augment Slot 5 Type 

| augslot5visible 
| tinyint 
| Augment Slot 5 Visible: 0 = False, 1 = True 

| augslot6type 
| tinyint 
| Augment Slot 6 Type 

| augslot6visible 
| tinyint 
| Augment Slot 6 Visible: 0 = False, 1 = True 

| augtype 
| int 
| Augment Type 

| avoidance 
| int 
| Avoidance 

| awis 
| int 
| Wisdom: -128 to 127 

| bagsize 
| int 
| Bag Size 

| bagslots 
| int 
| Bag Slots: 1 = Minimum, 10 = Maximum 

| bagtype 
| int 
| Bag Type 

| bagwr 
| int 
| Bag Weight Reduction: 0 = 0%, 100 = 100% 

| banedmgamt 
| int 
| Bane Damage Amount 

| banedmgraceamt 
| int 
| Bane Damage Race Amount 

| banedmgbody 
| int 
| Bane Damage Body Type 

| banedmgrace 
| int 
| Bane Damage Race 

| bardtype 
| int 
| Bard Type 

| bardvalue 
| int 
| Bard Value 

| book 
| int 
| Book 

| casttime 
| int 
| Cast Time in Seconds 

| casttime_ 
| int 
| Cast Time in Seconds 

| charmfile 
| varchar 
| Charm File 

| charmfileid 
| varchar 
| Charm File Identifier 

| classes 
| int 
| Classes 

| color 
| int 
| Color 

| combateffects 
| varchar 
| Combat Effects 

| extradmgskill 
| int 
| Extra Damage Skill 

| extradmgamt 
| int 
| Extra Damage Amount 

| price 
| int 
| Price in Copper 

| cr 
| int 
| Cold Resistance: -128 to 127 

| damage 
| int 
| Damage 

| damageshield 
| int 
| Damage Shield 

| deity 
| int 
| Deity 

| delay 
| int 
| Delay 

| augdistiller 
| int 
| Augment Distiller Item Identifier 

| dotshielding 
| int 
| Damage Over Time Shielding 

| dr 
| int 
| Disease Resistance: -128 to 127 

| clicktype 
| int 
| Click Type 

| clicklevel2 
| int 
| Click Level 2 

| elemdmgtype 
| int 
| Elemental Damage Type 

| elemdmgamt 
| int 
| Elemental Damage Amount 

| endur 
| int 
| Endurance 

| factionamt1 
| int 
| Faction Amount 1 

| factionamt2 
| int 
| Faction Amount 2 

| factionamt3 
| int 
| Faction Amount 3 

| factionamt4 
| int 
| Faction Amount 4 

| factionmod1 
| int 
| Faction Modifier 1 

| factionmod2 
| int 
| Faction Modifier 2 

| factionmod3 
| int 
| Faction Modifier 3 

| factionmod4 
| int 
| Faction Modifier 4 

| filename 
| varchar 
| File Name 

| focuseffect 
| int 
| Focus Effect Identifier 

| fr 
| int 
| Fire Resistance: -128 to 127 

| fvnodrop 
| int 
| Firiona Vie No Drop: 0 = False, 1 = True 

| haste 
| int 
| Haste: 0 = 0%, 255 = 255% 

| clicklevel 
| int 
| Click Level 

| hp 
| int 
| Health 

| regen 
| int 
| Health Regeneration 

| icon 
| int 
| Icon 

| idfile 
| varchar 
| Item Texture 

| itemclass 
| int 
| Item Class 

| itemtype 
| int 
| Item Type 

| ldonprice 
| int 
| LDoN Price 

| ldontheme 
| int 
| LDoN Theme 

| ldonsold 
| int 
| LDoN Sold: 0 = False, 1 = True 

| light 
| int 
| Light 

| lore 
| varchar 
| Lore Description 

| loregroup 
| int 
| Lore Group 

| magic 
| int 
| Magic: 0 = False, 1 = True 

| mana 
| int 
| Mana 

| manaregen 
| int 
| Mana Regeneration 

| enduranceregen 
| int 
| Endurance Regeneration 

| material 
| int 
| Material 

| herosforgemodel 
| int 
| Hero's Forge Model 

| maxcharges 
| int 
| Maximum Charges 

| mr 
| int 
| Magic Resistance: -128 to 127 

| nodrop 
| int 
| No Drop: 0 = True, 1 = False 

| norent 
| int 
| No Rent: 0 = True, 1 = False 

| pendingloreflag 
| tinyint 
| Pending Lore Flag: 0 = False, 1 = True 

| pr 
| int 
| Poison Resistance: -128 to 127 

| procrate 
| int 
| Proc Rate: 0 = 100%, 50 = 150%, 100 = 200% 

| races 
| int 
| Races 

| range 
| int 
| Range: 0 to 255 

| reclevel 
| int 
| Recommended Level 

| recskill 
| int 
| Recommended Skill Level 

| reqlevel 
| int 
| Required Level 

| sellrate 
| float 
| Sell Rate 

| shielding 
| int 
| Shielding: 5 = 5%, 20 = 20%, 50 = 50% 

| size 
| int 
| Size 

| skillmodtype 
| int 
| Skill Modifier Type 

| skillmodvalue 
| int 
| Skill Modifier Value 

| slots 
| int 
| Slots 

| clickeffect 
| int 
| Click Effect Identifier 

| spellshield 
| int 
| Spell Shielding 

| strikethrough 
| int 
| Strikethrough 

| stunresist 
| int 
| Stun Resist 

| summonedflag 
| tinyint 
| Unknown 

| tradeskills 
| int 
| Tradeskill Item: 0 = False, 1= True 

| favor 
| int 
| Favor 

| weight 
| int 
| Weight: 10 = 1.0, 25 = 2.5, 100 = 10.0 

| UNK012 
| int 
| Unknown 

| UNK013 
| int 
| Unknown 

| benefitflag 
| int 
| Unknown 

| UNK054 
| int 
| Unknown 

| UNK059 
| int 
| Unknown 

| booktype 
| int 
| Book Language 

| recastdelay 
| int 
| Recast Delay in Seconds 

| recasttype 
| int 
| Recast Type: -1 = None, >0 = Recast Type used across all items 

| guildfavor 
| int 
| Guild Favor 

| UNK123 
| int 
| Unknown 

| UNK124 
| int 
| Unknown 

| attuneable 
| int 
| Attuneable: 0 = False, 1 = True 

| nopet 
| int 
| No Pet: 0 = False, 1 = True 

| updated 
| datetime 
| Updated Datetime 

| comment 
| varchar 
| Comment 

| UNK127 
| int 
| Unknown 

| pointtype 
| int 
| Unknown 

| potionbelt 
| int 
| Potion Belt: 0 = False, 1 = True 

| potionbeltslots 
| int 
| Potion Belt Slots 

| stacksize 
| int 
| Stack Size 

| notransfer 
| int 
| No Transfer: 0 = False, 1 = True 

| stackable 
| int 
| Stackable: 0 = False, 1 = True 

| UNK134 
| varchar 
| Unknown 

| UNK137 
| int 
| Unknown 

| proceffect 
| int 
| Proc Effect Identifier 

| proctype 
| int 
| Proc Type: 0 

| proclevel2 
| int 
| Proc Level 2 

| proclevel 
| int 
| Proc Level 

| UNK142 
| int 
| Unknown 

| worneffect 
| int 
| Worn Effect Identifier 

| worntype 
| int 
| Worn Type: 2 = Worn 

| wornlevel2 
| int 
| Worn Level 2 

| wornlevel 
| int 
| Worn Level 

| UNK147 
| int 
| Unknown 

| focustype 
| int 
| Focus Type: 6 = Focus 

| focuslevel2 
| int 
| Focus Level 2 

| focuslevel 
| int 
| Focus Level 

| UNK152 
| int 
| Unknown 

| scrolleffect 
| int 
| Scroll Effect Identifier 

| scrolltype 
| int 
| Scroll Type: 7 = Scroll 

| scrolllevel2 
| int 
| Scroll Level 2 

| scrolllevel 
| int 
| Scroll Level 

| UNK157 
| int 
| Unknown 

| serialized 
| datetime 
| Serialized Datetime 

| verified 
| datetime 
| Verified Datetime 

| serialization 
| text 
| Serialization 

| source 
| varchar 
| Source 

| UNK033 
| int 
| Unknown 

| lorefile 
| varchar 
| Lore File 

| UNK014 
| int 
| Unknown 

| svcorruption 
| int 
| Corruption Resistance: -128 to 127 

| skillmodmax 
| int 
| Skill Modifier Max 

| UNK060 
| int 
| Unknown 

| augslot1unk2 
| int 
| Unknown 

| augslot2unk2 
| int 
| Unknown 

| augslot3unk2 
| int 
| Unknown 

| augslot4unk2 
| int 
| Unknown 

| augslot5unk2 
| int 
| Unknown 

| augslot6unk2 
| int 
| Unknown 

| UNK120 
| int 
| Unknown 

| UNK121 
| int 
| Unknown 

| questitemflag 
| int 
| Quest Item: 0 = False, 1 = True 

| UNK132 
| text 
| Unknown 

| clickunk5 
| int 
| Unknown 

| clickunk6 
| varchar 
| Unknown 

| clickunk7 
| int 
| Unknown 

| procunk1 
| int 
| Unknown 

| procunk2 
| int 
| Unknown 

| procunk3 
| int 
| Unknown 

| procunk4 
| int 
| Unknown 

| procunk6 
| varchar 
| Unknown 

| procunk7 
| int 
| Unknown 

| wornunk1 
| int 
| Unknown 

| wornunk2 
| int 
| Unknown 

| wornunk3 
| int 
| Unknown 

| wornunk4 
| int 
| Unknown 

| wornunk5 
| int 
| Unknown 

| wornunk6 
| varchar 
| Unknown 

| wornunk7 
| int 
| Unknown 

| focusunk1 
| int 
| Unknown 

| focusunk2 
| int 
| Unknown 

| focusunk3 
| int 
| Unknown 

| focusunk4 
| int 
| Unknown 

| focusunk5 
| int 
| Unknown 

| focusunk6 
| varchar 
| Unknown 

| focusunk7 
| int 
| Unknown 

| scrollunk1 
| int 
| Unknown 

| scrollunk2 
| int 
| Unknown 

| scrollunk3 
| int 
| Unknown 

| scrollunk4 
| int 
| Unknown 

| scrollunk5 
| int 
| Unknown 

| scrollunk6 
| varchar 
| Unknown 

| scrollunk7 
| int 
| Unknown 

| UNK193 
| int 
| Unknown 

| purity 
| int 
| Purity 

| evoitem 
| int 
| Evolving Item: 0 = False, 1 = True 

| evoid 
| int 
| Evolving Identifier 

| evolvinglevel 
| int 
| Evolving Level 

| evomax 
| int 
| Evolving Max 

| clickname 
| varchar 
| Click Name 

| procname 
| varchar 
| Proc Name 

| wornname 
| varchar 
| Worn Name 

| focusname 
| varchar 
| Focus Name 

| scrollname 
| varchar 
| Scroll Name 

| dsmitigation 
| smallint 
| Damage Shield Mitigation 

| heroic_str 
| smallint 
| Heroic Strength 

| heroic_int 
| smallint 
| Heroic Intelligence 

| heroic_wis 
| smallint 
| Heroic Wisdom 

| heroic_agi 
| smallint 
| Heroic Agility 

| heroic_dex 
| smallint 
| Heroic Dexterity 

| heroic_sta 
| smallint 
| Heroic Stamina 

| heroic_cha 
| smallint 
| Heroic Charisma 

| heroic_pr 
| smallint 
| Heroic Poison Resistance 

| heroic_dr 
| smallint 
| Heroic Disease Resistance 

| heroic_fr 
| smallint 
| Heroic Fire Resistance 

| heroic_cr 
| smallint 
| Heroic Cold Resistance 

| heroic_mr 
| smallint 
| Heroic Magic Resistance 

| heroic_svcorrup 
| smallint 
| Heroic Corruption Resistance 

| healamt 
| smallint 
| Heal Amount: 0 to 32767 

| spelldmg 
| smallint 
| Spell Damage: 0 to 32767 

| clairvoyance 
| smallint 
| Clairvoyance 

| backstabdmg 
| smallint 
| Backstab Damage 

| created 
| varchar 
| Created 

| elitematerial 
| smallint 
| Elite Material 

| ldonsellbackrate 
| smallint 
| LDoN Sellback Rate 

| scriptfileid 
| mediumint 
| Script File Name 

| expendablearrow 
| smallint 
| Expendable Arrow: 0 = False, 1 = True 

| powersourcecapacity 
| mediumint 
| Powersource Capacity 

| bardeffect 
| mediumint 
| Bard Effect Identifier 

| bardeffecttype 
| smallint 
| Bard Effect Type 

| bardlevel2 
| smallint 
| Bard Level 2 

| bardlevel 
| smallint 
| Bard Level 

| bardunk1 
| smallint 
| Unknown 

| bardunk2 
| smallint 
| Unknown 

| bardunk3 
| smallint 
| Unknown 

| bardunk4 
| smallint 
| Unknown 

| bardunk5 
| smallint 
| Unknown 

| bardname 
| varchar 
| Bard Name 

| bardunk7 
| smallint 
| Unknown 

| UNK214 
| smallint 
| Unknown 

| subtype 
| int 
| Sub Type 

| UNK220 
| int 
| Unknown 

| UNK221 
| int 
| Unknown 

| heirloom 
| int 
| Heirloom: 0 = False, 1 = True 

| UNK223 
| int 
| Unknown 

| UNK224 
| int 
| Unknown 

| UNK225 
| int 
| Unknown 

| UNK226 
| int 
| Unknown 

| UNK227 
| int 
| Unknown 

| UNK228 
| int 
| Unknown 

| UNK229 
| int 
| Unknown 

| UNK230 
| int 
| Unknown 

| UNK231 
| int 
| Unknown 

| UNK232 
| int 
| Unknown 

| UNK233 
| int 
| Unknown 

| UNK234 
| int 
| Unknown 

| placeable 
| int 
| Placeable: 0 = False, 1 = True 

| UNK236 
| int 
| Unknown 

| UNK237 
| int 
| Unknown 

| UNK238 
| int 
| Unknown 

| UNK239 
| int 
| Unknown 

| UNK240 
| int 
| Unknown 

| UNK241 
| int 
| Unknown 

| epicitem 
| int 
| Epic Item: 0 = False, 1 = True

---

## global_loot

*Source: schema/loot/global_loot/index.html*

# global_loot¶

## Relationships¶

```
erDiagram
 global_loot {
 varchar content_flags
 varchar content_flags_disabled
 int loottable_id
 mediumtext zone
 }
 content_flags {
 varchar flag_name
 }
 loottable {
 varchar content_flags
 varchar content_flags_disabled
 intunsigned id
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 global_loot ||--o{ content_flags : "One-to-One"
 global_loot ||--o{ content_flags : "One-to-One"
 global_loot ||--o{ loottable : "One-to-One"
 global_loot ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| content_flags 
| content_flags 
| flag_name 

| One-to-One 
| content_flags_disabled 
| content_flags 
| flag_name 

| One-to-One 
| loottable_id 
| loottable 
| id 

| One-to-One 
| zone 
| zone 
| short_name 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Global Loot Identifier 

| description 
| varchar 
| Description 

| loottable_id 
| int 
| Loottable Identifier 

| enabled 
| tinyint 
| Enabled: 0 = False, 1 = True 

| min_level 
| int 
| Minimum Level 

| max_level 
| int 
| Maximum Level 

| rare 
| tinyint 
| Rare: 0 = False, 1 = True 

| raid 
| tinyint 
| Raid: 0 = False, 1 = True 

| race 
| mediumtext 
| Race, multiple races supported if 

| class 
| mediumtext 
| Class, multiple classes supported if 

| bodytype 
| mediumtext 
| Body Type, multiple body types supported if 

| zone 
| mediumtext 
| Zone Short Name,, multiple zones supported if 

| hot_zone 
| tinyint 
| Hot Zone: 0 = False, 1 = True 

| min_expansion 
| tinyint 
| Minimum Expansion 

| max_expansion 
| tinyint 
| Maximum Expansion 

| content_flags 
| varchar 
| Content Flags Required to be Enabled 

| content_flags_disabled 
| varchar 
| Content Flags Required to be Disabled

---

## lootdrop

*Source: schema/loot/lootdrop/index.html*

# lootdrop¶

## Relationships¶

```
erDiagram
 lootdrop {
 varchar content_flags
 varchar content_flags_disabled
 intunsigned id
 }
 content_flags {
 varchar flag_name
 }
 lootdrop_entries {
 int item_id
 intunsigned lootdrop_id
 }
 loottable_entries {
 intunsigned loottable_id
 intunsigned lootdrop_id
 }
 lootdrop ||--o{ content_flags : "One-to-One"
 lootdrop ||--o{ content_flags : "One-to-One"
 lootdrop ||--o{ lootdrop_entries : "Has-Many"
 lootdrop ||--o{ loottable_entries : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| content_flags 
| content_flags 
| flag_name 

| One-to-One 
| content_flags_disabled 
| content_flags 
| flag_name 

| Has-Many 
| id 
| lootdrop_entries 
| lootdrop_id 

| Has-Many 
| id 
| loottable_entries 
| loottable_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Lootdrop Identifier 

| name 
| varchar 
| Name 

| min_expansion 
| tinyint 
| Minimum Expansion 

| max_expansion 
| tinyint 
| Maximum Expansion 

| content_flags 
| varchar 
| Content Flags Required to be Enabled 

| content_flags_disabled 
| varchar 
| Content Flags Required to be Disabled

---

## lootdrop_entries

*Source: schema/loot/lootdrop_entries/index.html*

# lootdrop_entries¶

## Relationships¶

```
erDiagram
 lootdrop_entries {
 int item_id
 intunsigned lootdrop_id
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 lootdrop {
 varchar content_flags
 varchar content_flags_disabled
 intunsigned id
 }
 lootdrop_entries ||--o{ items : "One-to-One"
 lootdrop_entries ||--o{ lootdrop : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| item_id 
| items 
| id 

| One-to-One 
| lootdrop_id 
| lootdrop 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| lootdrop_id 
| int 
| Lootdrop Identifier 

| item_id 
| int 
| Item Identifier 

| item_charges 
| smallint 
| Item Charges 

| equip_item 
| tinyint 
| Equip Item: 0 = False, 1 = True 

| chance 
| float 
| Chance: 0 = Never, 100 = Always 

| disabled_chance 
| float 
| Disabled Chance: 0 = Never, 100 = Always 

| trivial_min_level 
| smallint 
| Trivial Minimum Level 

| trivial_max_level 
| smallint 
| Trivial Maximum Level 

| multiplier 
| tinyint 
| Multiplier 

| npc_min_level 
| smallint 
| NPC Minimum Level 

| npc_max_level 
| smallint 
| NPC Maximum Level

---

## loottable

*Source: schema/loot/loottable/index.html*

# loottable¶

## Relationships¶

```
erDiagram
 loottable {
 varchar content_flags
 varchar content_flags_disabled
 intunsigned id
 }
 content_flags {
 varchar flag_name
 }
 global_loot {
 varchar content_flags
 varchar content_flags_disabled
 int loottable_id
 mediumtext zone
 }
 loottable_entries {
 intunsigned loottable_id
 intunsigned lootdrop_id
 }
 npc_types {
 intunsigned alt_currency_id
 int id
 int npc_faction_id
 text name
 intunsigned loottable_id
 intunsigned merchant_id
 intunsigned emoteid
 intunsigned adventure_template_id
 intunsigned armortint_id
 intunsigned npc_spells_id
 intunsigned npc_spells_effects_id
 intunsigned trap_template
 }
 loottable ||--o{ content_flags : "One-to-One"
 loottable ||--o{ content_flags : "One-to-One"
 loottable ||--o{ global_loot : "Has-Many"
 loottable ||--o{ loottable_entries : "Has-Many"
 loottable ||--o{ npc_types : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| content_flags 
| content_flags 
| flag_name 

| One-to-One 
| content_flags_disabled 
| content_flags 
| flag_name 

| Has-Many 
| id 
| global_loot 
| loottable_id 

| Has-Many 
| id 
| loottable_entries 
| loottable_id 

| Has-Many 
| id 
| npc_types 
| loottable_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Loottable Identifier 

| name 
| varchar 
| Name 

| mincash 
| int 
| Minimum Cash in Copper 

| maxcash 
| int 
| Maximum Cash in Copper 

| avgcoin 
| int 
| Average Coin in Copper 

| done 
| tinyint 
| Done: 0 = False, 1 = True 

| min_expansion 
| tinyint 
| Minimum Expansion 

| max_expansion 
| tinyint 
| Maximum Expansion 

| content_flags 
| varchar 
| Content Flags Required to be Enabled 

| content_flags_disabled 
| varchar 
| Content Flags Required to be Disabled

---

## loottable_entries

*Source: schema/loot/loottable_entries/index.html*

# loottable_entries¶

## Relationships¶

```
erDiagram
 loottable_entries {
 intunsigned loottable_id
 intunsigned lootdrop_id
 }
 loottable {
 varchar content_flags
 varchar content_flags_disabled
 intunsigned id
 }
 lootdrop_entries {
 int item_id
 intunsigned lootdrop_id
 }
 loottable_entries ||--o{ loottable : "One-to-One"
 loottable_entries ||--o{ lootdrop_entries : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| loottable_id 
| loottable 
| id 

| Has-Many 
| lootdrop_id 
| lootdrop_entries 
| lootdrop_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| loottable_id 
| int 
| Loottable Identifier 

| lootdrop_id 
| int 
| Lootdrop Identifier 

| multiplier 
| tinyint 
| Multiplier 

| droplimit 
| tinyint 
| Maximum Drops 

| mindrop 
| tinyint 
| Minimum Drops 

| probability 
| float 
| Probability: 0 = Never, 100 = Always

---

## merc_armorinfo

*Source: schema/mercenaries/merc_armorinfo/index.html*

# merc_armorinfo¶

## Relationships¶

```
erDiagram
 merc_armorinfo {
 varchar armortint_id
 varchar merc_npc_type_id
 }
 npc_types_tint {
 intunsigned id
 }
 merc_npc_types {
 varchar merc_npc_type_id
 }
 merc_armorinfo ||--o{ npc_types_tint : "Has-Many"
 merc_armorinfo ||--o{ merc_npc_types : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| armortint_id 
| npc_types_tint 
| id 

| One-to-One 
| merc_npc_type_id 
| merc_npc_types 
| merc_npc_type_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Mercenary Armor Info Identifier 

| merc_npc_type_id 
| int 
| Mercenary NPC Type Identifier 

| minlevel 
| tinyint 
| Minimum Level 

| maxlevel 
| tinyint 
| Maximum Level 

| texture 
| tinyint 
| Texture 

| helmtexture 
| tinyint 
| Helmet Texture 

| armortint_id 
| int 
| Armor Tint Identifier 

| armortint_red 
| tinyint 
| Armor Tint Red: 0 = None, 255 = Max 

| armortint_green 
| tinyint 
| Armor Tint Green: 0 = None, 255 = Max 

| armortint_blue 
| tinyint 
| Armor Tint Blue: 0 = None, 255 = Max

---

## merc_buffs

*Source: schema/mercenaries/merc_buffs/index.html*

# merc_buffs¶

## Relationships¶

```
erDiagram
 merc_buffs {
 intunsigned MercId
 intunsigned SpellId
 }
 merc {
 varchar MercID
 }
 spells_new {
 int id
 int descnum
 int effectdescnum
 int effectdescnum2
 int typedescnum
 varchar teleport_zone
 }
 merc_buffs ||--o{ merc : "One-to-One"
 merc_buffs ||--o{ spells_new : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| MercId 
| merc 
| MercID 

| One-to-One 
| SpellId 
| spells_new 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| MercBuffId 
| int 
| Unique Mercenary Buff Identifier 

| MercId 
| int 
| Mercenary Identifier 

| SpellId 
| int 
| Spell Identifier 

| CasterLevel 
| int 
| Caster Level 

| DurationFormula 
| int 
| Duration Formula 

| TicsRemaining 
| int 
| Tics Remaining 

| PoisonCounters 
| int 
| Poison Counters 

| DiseaseCounters 
| int 
| Disease Counters 

| CurseCounters 
| int 
| Curse Counters 

| CorruptionCounters 
| int 
| Corruption Counters 

| HitCount 
| int 
| Hit Count 

| MeleeRune 
| int 
| Melee Rune 

| MagicRune 
| int 
| Magic Rune 

| dot_rune 
| int 
| Damage Over Time Rune 

| caston_x 
| int 
| Cast On X Coordinate 

| Persistent 
| tinyint 
| Persistent: 0 = False, 1 = True 

| caston_y 
| int 
| Cast On Y Coordinate 

| caston_z 
| int 
| Cast On Z Coordinate 

| ExtraDIChance 
| int 
| Extra DI Chance

---

## merc_inventory

*Source: schema/mercenaries/merc_inventory/index.html*

# merc_inventory¶

## Relationships¶

```
erDiagram
 merc_inventory {
 varchar item_id
 varchar merc_subtype_id
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 merc_subtypes {
 varchar merc_subtype_id
 }
 merc_inventory ||--o{ items : "One-to-One"
 merc_inventory ||--o{ merc_subtypes : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| item_id 
| items 
| id 

| One-to-One 
| merc_subtype_id 
| merc_subtypes 
| merc_subtype_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| merc_inventory_id 
| int 
| Unique Mercenary Inventory Identifier 

| merc_subtype_id 
| int 
| Mercenary Subtype Identifier 

| item_id 
| int 
| Item Identifier 

| min_level 
| int 
| Minimum Level 

| max_level 
| int 
| Maximum Level

---

## merc_merchant_entries

*Source: schema/mercenaries/merc_merchant_entries/index.html*

# merc_merchant_entries¶

## Relationships¶

```
erDiagram
 merc_merchant_entries {
 varchar merc_merchant_template_id
 varchar merchant_id
 }
 merc_merchant_templates {
 varchar merc_merchant_template_id
 varchar qglobal
 }
 npc_types {
 intunsigned alt_currency_id
 int id
 int npc_faction_id
 text name
 intunsigned loottable_id
 intunsigned merchant_id
 intunsigned emoteid
 intunsigned adventure_template_id
 intunsigned armortint_id
 intunsigned npc_spells_id
 intunsigned npc_spells_effects_id
 intunsigned trap_template
 }
 merc_merchant_entries ||--o{ merc_merchant_templates : "One-to-One"
 merc_merchant_entries ||--o{ npc_types : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| merc_merchant_template_id 
| merc_merchant_templates 
| merc_merchant_template_id 

| One-to-One 
| merchant_id 
| npc_types 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| merc_merchant_entry_id 
| int 
| Unique Mercenary Merchant Entry Identifier 

| merc_merchant_template_id 
| int 
| Mercenary Merchant Template Identifier 

| merchant_id 
| int 
| Merchant Identifier

---

## merc_merchant_template_entries

*Source: schema/mercenaries/merc_merchant_template_entries/index.html*

# merc_merchant_template_entries¶

## Relationships¶

```
erDiagram
 merc_merchant_template_entries {
 varchar merc_merchant_template_id
 varchar merc_template_id
 varchar merc_merchant_template_entry_id
 }
 merc_merchant_templates {
 varchar merc_merchant_template_id
 varchar qglobal
 }
 merc_templates {
 varchar dbstring
 varchar merc_template_id
 varchar name_type_id
 varchar merc_npc_type_id
 varchar merc_subtype_id
 varchar merc_type_id
 }
 merc_merchant_template_entries ||--o{ merc_merchant_templates : "One-to-One"
 merc_merchant_template_entries ||--o{ merc_templates : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| merc_merchant_template_id 
| merc_merchant_templates 
| merc_merchant_template_id 

| One-to-One 
| merc_template_id 
| merc_templates 
| merc_template_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| merc_merchant_template_entry_id 
| int 
| Unique Mercenary Merchant Template Entry Identifier 

| merc_merchant_template_id 
| int 
| Mercenary Merchant Template Identifier 

| merc_template_id 
| int 
| Mercenary Template Identifier

---

## merc_merchant_templates

*Source: schema/mercenaries/merc_merchant_templates/index.html*

# merc_merchant_templates¶

## Relationships¶

```
erDiagram
 merc_merchant_templates {
 varchar merc_merchant_template_id
 varchar qglobal
 }
 merc_merchant_entries {
 varchar merc_merchant_template_id
 varchar merchant_id
 }
 merc_merchant_template_entries {
 varchar merc_merchant_template_id
 varchar merc_template_id
 varchar merc_merchant_template_entry_id
 }
 quest_globals {
 int charid
 varchar name
 int npcid
 int zoneid
 }
 merc_merchant_templates ||--o{ merc_merchant_entries : "Has-Many"
 merc_merchant_templates ||--o{ merc_merchant_template_entries : "Has-Many"
 merc_merchant_templates ||--o{ quest_globals : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| merc_merchant_template_id 
| merc_merchant_entries 
| merc_merchant_template_id 

| Has-Many 
| merc_merchant_template_id 
| merc_merchant_template_entries 
| merc_merchant_template_id 

| Has-Many 
| qglobal 
| quest_globals 
| name 

## Schema¶

| 

Column 
| Data Type 
| Description 

| merc_merchant_template_id 
| int 
| Unique Mercenary Merchant Template Identifier 

| name 
| varchar 
| Name 

| qglobal 
| varchar 
| Quest Global (Deprecated)

---

## merc_name_types

*Source: schema/mercenaries/merc_name_types/index.html*

# merc_name_types¶

## Relationships¶

```
erDiagram
 merc_name_types {
 varchar name_type_id
 }
 merc_templates {
 varchar dbstring
 varchar merc_template_id
 varchar name_type_id
 varchar merc_npc_type_id
 varchar merc_subtype_id
 varchar merc_type_id
 }
 merc_name_types ||--o{ merc_templates : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| name_type_id 
| merc_templates 
| name_type_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| name_type_id 
| int 
| Mercenary Name Type Identifier 

| class_id 
| int 
| Class Identifier 

| prefix 
| varchar 
| Prefix 

| suffix 
| varchar 
| Suffix

---

## merc_npc_types

*Source: schema/mercenaries/merc_npc_types/index.html*

# merc_npc_types¶

## Relationships¶

```
erDiagram
 merc_npc_types {
 varchar merc_npc_type_id
 }
 merc_armorinfo {
 varchar armortint_id
 varchar merc_npc_type_id
 }
 merc_stats {
 varchar merc_npc_type_id
 }
 merc_templates {
 varchar dbstring
 varchar merc_template_id
 varchar name_type_id
 varchar merc_npc_type_id
 varchar merc_subtype_id
 varchar merc_type_id
 }
 merc_weaponinfo {
 varchar merc_npc_type_id
 }
 merc_npc_types ||--o{ merc_armorinfo : "Has-Many"
 merc_npc_types ||--o{ merc_stats : "Has-Many"
 merc_npc_types ||--o{ merc_templates : "Has-Many"
 merc_npc_types ||--o{ merc_weaponinfo : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| merc_npc_type_id 
| merc_armorinfo 
| merc_npc_type_id 

| Has-Many 
| merc_npc_type_id 
| merc_stats 
| merc_npc_type_id 

| Has-Many 
| merc_npc_type_id 
| merc_templates 
| merc_npc_type_id 

| Has-Many 
| merc_npc_type_id 
| merc_weaponinfo 
| merc_npc_type_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| merc_npc_type_id 
| int 
| Mercenary NPC Type Identifier 

| proficiency_id 
| tinyint 
| Proficiency Identifier 

| tier_id 
| tinyint 
| Tier Identifier 

| class_id 
| int 
| Class Identifier 

| name 
| varchar 
| Name

---

## merc_spell_list_entries

*Source: schema/mercenaries/merc_spell_list_entries/index.html*

# merc_spell_list_entries¶

## Relationships¶

```
erDiagram
 merc_spell_list_entries {
 varchar merc_spell_list_id
 varchar spell_id
 varchar stance_id
 }
 merc_spell_lists {
 varchar merc_spell_list_id
 }
 spells_new {
 int id
 int descnum
 int effectdescnum
 int effectdescnum2
 int typedescnum
 varchar teleport_zone
 }
 merc_stance_entries {
 varchar stance_id
 }
 merc_spell_list_entries ||--o{ merc_spell_lists : "One-to-One"
 merc_spell_list_entries ||--o{ spells_new : "One-to-One"
 merc_spell_list_entries ||--o{ merc_stance_entries : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| merc_spell_list_id 
| merc_spell_lists 
| merc_spell_list_id 

| One-to-One 
| spell_id 
| spells_new 
| id 

| Has-Many 
| stance_id 
| merc_stance_entries 
| stance_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| merc_spell_list_entry_id 
| int 
| Unique Mercenary Spell List Entry Identifier 

| merc_spell_list_id 
| int 
| Mercenary Spell List Identifier 

| spell_id 
| int 
| Spell Identifier 

| spell_type 
| int 
| Spell Type 

| stance_id 
| tinyint 
| Stance Type Identifier 

| minlevel 
| tinyint 
| Minimum Level 

| maxlevel 
| tinyint 
| Maximum Level 

| slot 
| tinyint 
| Slot 

| procChance 
| tinyint 
| Proc Chance: 0 = Never, 100 = Always

---

## merc_spell_lists

*Source: schema/mercenaries/merc_spell_lists/index.html*

# merc_spell_lists¶

## Relationships¶

```
erDiagram
 merc_spell_lists {
 varchar merc_spell_list_id
 }
 merc_spell_list_entries {
 varchar merc_spell_list_id
 varchar spell_id
 varchar stance_id
 }
 merc_spell_lists ||--o{ merc_spell_list_entries : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| merc_spell_list_id 
| merc_spell_list_entries 
| merc_spell_list_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| merc_spell_list_id 
| int 
| Unique Mercenary Spell List Identifier 

| class_id 
| int 
| Class Identifier 

| proficiency_id 
| tinyint 
| Proficiency Identifier 

| name 
| varchar 
| Name

---

## merc_stance_entries

*Source: schema/mercenaries/merc_stance_entries/index.html*

# merc_stance_entries¶

## Relationships¶

```
erDiagram
 merc_stance_entries {
 varchar stance_id
 }
 merc_spell_list_entries {
 varchar merc_spell_list_id
 varchar spell_id
 varchar stance_id
 }
 merc_stance_entries ||--o{ merc_spell_list_entries : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| stance_id 
| merc_spell_list_entries 
| stance_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| merc_stance_entry_id 
| int 
| Unique Mercenary Stance Entry Identifier 

| class_id 
| int 
| Class Identifier 

| proficiency_id 
| tinyint 
| Proficiency Identifier 

| stance_id 
| tinyint 
| Stance Type Identifier 

| isdefault 
| tinyint 
| Is Default: 0 = False, 1 = True

---

## merc_stats

*Source: schema/mercenaries/merc_stats/index.html*

# merc_stats¶

## Relationships¶

```
erDiagram
 merc_stats {
 varchar merc_npc_type_id
 }
 merc_npc_types {
 varchar merc_npc_type_id
 }
 merc_stats ||--o{ merc_npc_types : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| merc_npc_type_id 
| merc_npc_types 
| merc_npc_type_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| merc_npc_type_id 
| int 
| Mercenary NPC Type Identifier 

| clientlevel 
| tinyint 
| Client Level 

| level 
| tinyint 
| Level 

| hp 
| int 
| Health 

| mana 
| int 
| Mana 

| AC 
| smallint 
| Armor Class 

| ATK 
| mediumint 
| Attack 

| STR 
| mediumint 
| Strength 

| STA 
| mediumint 
| Stamina 

| DEX 
| mediumint 
| Dexterity 

| AGI 
| mediumint 
| Agility 

| _INT 
| mediumint 
| Intelligence 

| WIS 
| mediumint 
| Wisdom 

| CHA 
| mediumint 
| Charisma 

| MR 
| smallint 
| Magic Resistance 

| CR 
| smallint 
| Cold Resistance 

| DR 
| smallint 
| Disease Resistance 

| FR 
| smallint 
| Fire Resistance 

| PR 
| smallint 
| Poison Resistance 

| Corrup 
| smallint 
| Corruption Resistance 

| mindmg 
| int 
| Minimum Damage 

| maxdmg 
| int 
| Maximum Damage 

| attack_count 
| smallint 
| Attack Count 

| attack_speed 
| tinyint 
| Attack Speed: The lower the number, the faster the NPC hits. (Deprecated) 

| attack_delay 
| tinyint 
| Attack Delay: Delay between the attack arounds in 10ths of a second. 

| special_abilities 
| text 
| Special Abilities 

| Accuracy 
| mediumint 
| Accuracy 

| hp_regen_rate 
| int 
| Health Regeneration Rate 

| mana_regen_rate 
| int 
| Mana Regeneration Rate 

| runspeed 
| float 
| Run Speed 

| statscale 
| int 
| Stat Scale: 50 = 50%, 100 = 100%, 150 = 150% 

| spellscale 
| float 
| Spell Scale: 50 = 50%, 100 = 100%, 150 = 150% 

| healscale 
| float 
| Heal Scale: 50 = 50%, 100 = 100%, 150 = 150%

---

## merc_subtypes

*Source: schema/mercenaries/merc_subtypes/index.html*

# merc_subtypes¶

## Relationships¶

```
erDiagram
 merc_subtypes {
 varchar merc_subtype_id
 }
 merc_inventory {
 varchar item_id
 varchar merc_subtype_id
 }
 merc_templates {
 varchar dbstring
 varchar merc_template_id
 varchar name_type_id
 varchar merc_npc_type_id
 varchar merc_subtype_id
 varchar merc_type_id
 }
 merc_subtypes ||--o{ merc_inventory : "Has-Many"
 merc_subtypes ||--o{ merc_templates : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| merc_subtype_id 
| merc_inventory 
| merc_subtype_id 

| Has-Many 
| merc_subtype_id 
| merc_templates 
| merc_subtype_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| merc_subtype_id 
| int 
| Unique Mercenary Subtype Identifier 

| class_id 
| int 
| Class Identifier 

| tier_id 
| tinyint 
| Tier Identifier 

| confidence_id 
| tinyint 
| Confidence Identifier

---

## merc_templates

*Source: schema/mercenaries/merc_templates/index.html*

# merc_templates¶

## Relationships¶

```
erDiagram
 merc_templates {
 varchar dbstring
 varchar merc_template_id
 varchar name_type_id
 varchar merc_npc_type_id
 varchar merc_subtype_id
 varchar merc_type_id
 }
 db_str {
 int id
 }
 merc_npc_types {
 varchar merc_npc_type_id
 }
 merc_merchant_template_entries {
 varchar merc_merchant_template_id
 varchar merc_template_id
 varchar merc_merchant_template_entry_id
 }
 mercs {
 intunsigned OwnerCharacterID
 intunsigned TemplateID
 intunsigned MercID
 tinyintunsigned StanceID
 }
 merc_subtypes {
 varchar merc_subtype_id
 }
 merc_templates ||--o{ db_str : "One-to-One"
 merc_templates ||--o{ merc_npc_types : "One-to-One"
 merc_templates ||--o{ merc_merchant_template_entries : "One-to-One"
 merc_templates ||--o{ merc_merchant_template_entries : "One-to-One"
 merc_templates ||--o{ mercs : "One-to-One"
 merc_templates ||--o{ merc_subtypes : "One-to-One"

```

```
erDiagram
 merc_templates {
 varchar dbstring
 varchar merc_template_id
 varchar name_type_id
 varchar merc_npc_type_id
 varchar merc_subtype_id
 varchar merc_type_id
 }
 merc_name_types {
 varchar name_type_id
 }
 merc_templates ||--o{ merc_name_types : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| dbstring 
| db_str 
| id 

| One-to-One 
| merc_npc_type_id 
| merc_npc_types 
| merc_npc_type_id 

| One-to-One 
| merc_template_id 
| merc_merchant_template_entries 
| merc_merchant_template_entry_id 

| One-to-One 
| merc_template_id 
| merc_merchant_template_entries 
| merc_template_id 

| One-to-One 
| merc_template_id 
| mercs 
| TemplateID 

| One-to-One 
| merc_subtype_id 
| merc_subtypes 
| merc_subtype_id 

| One-to-One 
| name_type_id 
| merc_name_types 
| name_type_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| merc_template_id 
| int 
| Unique Mercenary Template Identifier 

| merc_type_id 
| int 
| Mercenary Type Identifier 

| merc_subtype_id 
| int 
| Mercenary Subtype Identifier 

| merc_npc_type_id 
| int 
| Mercenary NPC Type Identifier 

| dbstring 
| varchar 
| DBString Identifier 

| name_type_id 
| tinyint 
| Name Type Identifier 

| clientversion 
| int 
| Client Version

---

## merc_types

*Source: schema/mercenaries/merc_types/index.html*

# merc_types¶

## Relationships¶

```
erDiagram
 merc_types {
 varchar dbstring
 varchar merc_type_id
 }
 db_str {
 int id
 }
 merc_templates {
 varchar dbstring
 varchar merc_template_id
 varchar name_type_id
 varchar merc_npc_type_id
 varchar merc_subtype_id
 varchar merc_type_id
 }
 merc_types ||--o{ db_str : "One-to-One"
 merc_types ||--o{ merc_templates : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| dbstring 
| db_str 
| id 

| Has-Many 
| merc_type_id 
| merc_templates 
| merc_type_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| merc_type_id 
| int 
| Unique Mercenary Type Identifier 

| race_id 
| int 
| Race Identifier 

| proficiency_id 
| tinyint 
| Proficiency Identifier 

| dbstring 
| varchar 
| DBString Identifier 

| clientversion 
| int 
| Client Version

---

## merc_weaponinfo

*Source: schema/mercenaries/merc_weaponinfo/index.html*

# merc_weaponinfo¶

## Relationships¶

```
erDiagram
 merc_weaponinfo {
 varchar merc_npc_type_id
 }
 merc_npc_types {
 varchar merc_npc_type_id
 }
 merc_weaponinfo ||--o{ merc_npc_types : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| merc_npc_type_id 
| merc_npc_types 
| merc_npc_type_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Mercenary Weapon Info Identifier 

| merc_npc_type_id 
| int 
| Mercenary NPC Type Identifier 

| minlevel 
| tinyint 
| Minimum Level 

| maxlevel 
| tinyint 
| Maximum Level 

| d_melee_texture1 
| int 
| Primary Weapon Texture 

| d_melee_texture2 
| int 
| Secondary Weapon Texture 

| prim_melee_type 
| tinyint 
| Primary Melee Type 

| sec_melee_type 
| tinyint 
| Secondary Melee Type

---

## mercs

*Source: schema/mercenaries/mercs/index.html*

# mercs¶

## Relationships¶

```
erDiagram
 mercs {
 intunsigned OwnerCharacterID
 intunsigned TemplateID
 intunsigned MercID
 tinyintunsigned StanceID
 }
 merc_buffs {
 intunsigned MercId
 intunsigned SpellId
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 merc_spell_list_entries {
 varchar merc_spell_list_id
 varchar spell_id
 varchar stance_id
 }
 merc_stance_entries {
 varchar stance_id
 }
 merc_templates {
 varchar dbstring
 varchar merc_template_id
 varchar name_type_id
 varchar merc_npc_type_id
 varchar merc_subtype_id
 varchar merc_type_id
 }
 mercs ||--o{ merc_buffs : "Has-Many"
 mercs ||--o{ character_data : "One-to-One"
 mercs ||--o{ merc_spell_list_entries : "Has-Many"
 mercs ||--o{ merc_stance_entries : "Has-Many"
 mercs ||--o{ merc_templates : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| MercID 
| merc_buffs 
| MercId 

| One-to-One 
| OwnerCharacterID 
| character_data 
| id 

| Has-Many 
| StanceID 
| merc_spell_list_entries 
| stance_id 

| Has-Many 
| StanceID 
| merc_stance_entries 
| stance_id 

| One-to-One 
| TemplateID 
| merc_templates 
| merc_template_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| MercID 
| int 
| Unique Mercenary Identifier 

| OwnerCharacterID 
| int 
| Owner Character Identifier 

| Slot 
| tinyint 
| Slot 

| Name 
| varchar 
| Name 

| TemplateID 
| int 
| Template Identifier 

| SuspendedTime 
| int 
| Suspended Time UNIX Timestamp 

| IsSuspended 
| tinyint 
| Is Suspended: 0 = False, 1 = True 

| TimerRemaining 
| int 
| Timer Remaining in Seconds 

| Gender 
| tinyint 
| Gender 

| MercSize 
| float 
| Mercenary Size 

| StanceID 
| tinyint 
| Stance Type Identifier 

| HP 
| int 
| Health 

| Mana 
| int 
| Mana 

| Endurance 
| int 
| Endurance 

| Face 
| int 
| Face 

| LuclinHairStyle 
| int 
| Hair Style 

| LuclinHairColor 
| int 
| Hair Color 

| LuclinEyeColor 
| int 
| Eye Color 1 

| LuclinEyeColor2 
| int 
| Eye Color 2 

| LuclinBeardColor 
| int 
| Beard Color 

| LuclinBeard 
| int 
| Beard 

| DrakkinHeritage 
| int 
| Drakkin Heritage 

| DrakkinTattoo 
| int 
| Drakkin Tattoo 

| DrakkinDetails 
| int 
| Drakkin Details

---

## merchantlist

*Source: schema/merchants/merchantlist/index.html*

# merchantlist¶

## Relationships¶

```
erDiagram
 merchantlist {
 varchar content_flags
 varchar content_flags_disabled
 varchar bucket_name
 int item
 varchar merchant_id
 int merchantid
 }
 data_buckets {
 varchar key
 }
 content_flags {
 varchar flag_name
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 npc_types {
 intunsigned alt_currency_id
 int id
 int npc_faction_id
 text name
 intunsigned loottable_id
 intunsigned merchant_id
 intunsigned emoteid
 intunsigned adventure_template_id
 intunsigned armortint_id
 intunsigned npc_spells_id
 intunsigned npc_spells_effects_id
 intunsigned trap_template
 }
 merchantlist ||--o{ data_buckets : "One-to-One"
 merchantlist ||--o{ content_flags : "One-to-One"
 merchantlist ||--o{ content_flags : "One-to-One"
 merchantlist ||--o{ items : "One-to-One"
 merchantlist ||--o{ npc_types : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| bucket_name 
| data_buckets 
| key 

| One-to-One 
| content_flags 
| content_flags 
| flag_name 

| One-to-One 
| content_flags_disabled 
| content_flags 
| flag_name 

| One-to-One 
| item 
| items 
| id 

| Has-Many 
| merchant_id 
| npc_types 
| merchant_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| merchantid 
| int 
| Merchant Identifier 

| slot 
| int 
| Slot 

| item 
| int 
| Item Identifier 

| faction_required 
| smallint 
| Faction Required 

| level_required 
| tinyint 
| Level Required 

| min_status 
| tinyint 
| Minimum Status 

| max_status 
| tinyint 
| Maximum Status 

| alt_currency_cost 
| smallint 
| Alternate Currency Cost 

| classes_required 
| int 
| Classes Required 

| probability 
| int 
| Probability: 0 = Never, 100 = Always 

| bucket_name 
| varchar 
| Bucket Name 

| bucket_value 
| varchar 
| Bucket Value 

| bucket_comparison 
| tinyint 
| Bucket Comparison Type 

| min_expansion 
| tinyint 
| Minimum Expansion 

| max_expansion 
| tinyint 
| Maximum Expansion 

| content_flags 
| varchar 
| Content Flags Required to be Enabled 

| content_flags_disabled 
| varchar 
| Content Flags Required to be Disabled

---

## merchantlist_temp

*Source: schema/merchants/merchantlist_temp/index.html*

# merchantlist_temp¶

## Relationships¶

```
erDiagram
 merchantlist_temp {
 intunsigned itemid
 intunsigned npcid
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 npc_types {
 intunsigned alt_currency_id
 int id
 int npc_faction_id
 text name
 intunsigned loottable_id
 intunsigned merchant_id
 intunsigned emoteid
 intunsigned adventure_template_id
 intunsigned armortint_id
 intunsigned npc_spells_id
 intunsigned npc_spells_effects_id
 intunsigned trap_template
 }
 merchantlist_temp ||--o{ items : "One-to-One"
 merchantlist_temp ||--o{ npc_types : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| itemid 
| items 
| id 

| One-to-One 
| npcid 
| npc_types 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| npcid 
| int 
| NPC Type Identifier 

| slot 
| int 
| Slot 

| zone_id 
| int 
| Zone Identifier 

| instance_id 
| int 
| Instance Identifier 

| itemid 
| int 
| Item Identifier 

| charges 
| int 
| Charges

---

## npc_emotes

*Source: schema/npcs/npc_emotes/index.html*

# npc_emotes¶

## Relationships¶

```
erDiagram
 npc_emotes {
 intunsigned emoteid
 }
 npc_types {
 intunsigned alt_currency_id
 int id
 int npc_faction_id
 text name
 intunsigned loottable_id
 intunsigned merchant_id
 intunsigned emoteid
 intunsigned adventure_template_id
 intunsigned armortint_id
 intunsigned npc_spells_id
 intunsigned npc_spells_effects_id
 intunsigned trap_template
 }
 npc_emotes ||--o{ npc_types : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| emoteid 
| npc_types 
| emoteid 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique NPC Emote Identifier 

| emoteid 
| int 
| Emote Identifier 

| event_ 
| tinyint 
| Emote Event Type Identifier 

| type 
| tinyint 
| Emote Type Identifier 

| text 
| varchar 
| Text

---

## npc_faction

*Source: schema/npcs/npc_faction/index.html*

# npc_faction¶

## Relationships¶

```
erDiagram
 npc_faction {
 int id
 int primaryfaction
 }
 npc_faction_entries {
 intunsigned npc_faction_id
 intunsigned faction_id
 }
 faction_list {
 int id
 }
 npc_faction ||--o{ npc_faction_entries : "Has-Many"
 npc_faction ||--o{ faction_list : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| id 
| npc_faction_entries 
| npc_faction_id 

| One-to-One 
| primaryfaction 
| faction_list 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique NPC Faction Identifier 

| name 
| tinytext 
| Name 

| primaryfaction 
| int 
| Primary Faction Identifier 

| ignore_primary_assist 
| tinyint 
| Ignore Primary Assist: 0 = False, >0 = True

---

## npc_faction_entries

*Source: schema/npcs/npc_faction_entries/index.html*

# npc_faction_entries¶

## Relationships¶

```
erDiagram
 npc_faction_entries {
 intunsigned npc_faction_id
 intunsigned faction_id
 }
 faction_list {
 int id
 }
 npc_faction {
 int id
 int primaryfaction
 }
 npc_faction_entries ||--o{ faction_list : "One-to-One"
 npc_faction_entries ||--o{ npc_faction : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| faction_id 
| faction_list 
| id 

| One-to-One 
| npc_faction_id 
| npc_faction 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| npc_faction_id 
| int 
| NPC Faction Identifier 

| faction_id 
| int 
| Faction Identifier 

| value 
| int 
| Value 

| npc_value 
| tinyint 
| NPC Value: -1 = Attack, 0 = Neutral, 1 = Assist 

| temp 
| tinyint 
| Temeporary: 0 = Faction is permanent, player recieves a message, 1 = Faction is temporary, player does not recieve a message, 2 = Faction is temporary, player recieves a message, 3 = Faction is permanent, but player does not recieve a message.

---

## npc_scale_global_base

*Source: schema/npcs/npc_scale_global_base/index.html*

# npc_scale_global_base¶

## Schema¶

| 

Column 
| Data Type 
| Description 

| type 
| int 
| Type: 0 = Trash, 1 = Named, 2 = Raid 

| level 
| int 
| Level 

| zone_id_list 
| text 
| Zone Identifier List (Pipe ( 

| instance_version_list 
| text 
| Instance Version List (Pipe ( 

| ac 
| int 
| Armor Class 

| hp 
| bigint 
| Health 

| accuracy 
| int 
| Accuracy 

| slow_mitigation 
| int 
| Slow Mitigation 

| attack 
| int 
| Attack 

| strength 
| int 
| Strength 

| stamina 
| int 
| Stamina 

| dexterity 
| int 
| Dexterity 

| agility 
| int 
| Agility 

| intelligence 
| int 
| Intelligence 

| wisdom 
| int 
| Wisdom 

| charisma 
| int 
| Charisma 

| magic_resist 
| int 
| Magic Resistance 

| cold_resist 
| int 
| Cold Resistance 

| fire_resist 
| int 
| Fire Resistance 

| poison_resist 
| int 
| Poison Resistance 

| disease_resist 
| int 
| Disease Resistance 

| corruption_resist 
| int 
| Corruption Resistance 

| physical_resist 
| int 
| Physical Resistance 

| min_dmg 
| int 
| Minimum Damage 

| max_dmg 
| int 
| Maximum Damage 

| hp_regen_rate 
| bigint 
| Health Regeneration Rate 

| hp_regen_per_second 
| bigint 
| Health Regeneration Per Second 

| attack_delay 
| int 
| Attack Delay: Delay between the attack arounds in 10ths of a second. 

| spell_scale 
| int 
| Spell Scale: 50 = 50%, 100 = 100%, 150 = 150% 

| heal_scale 
| int 
| Heal Scale: 50 = 50%, 100 = 100%, 150 = 150% 

| avoidance 
| int 
| Avoidance 

| heroic_strikethrough 
| int 
| Heroic Strikethrough 

| special_abilities 
| text 
| Special Abilities

---

## npc_spells

*Source: schema/npcs/npc_spells/index.html*

# npc_spells¶

## Relationships¶

```
erDiagram
 npc_spells {
 intunsigned id
 intunsigned parent_list
 }
 bot_data {
 varchar bot_id
 varchar owner_id
 varchar spells_id
 varchar zone_id
 }
 bot_spells_entries {
 varchar type
 varchar npc_spells_id
 varchar spell_id
 varchar spellid
 }
 npc_spells_entries {
 int npc_spells_id
 smallintunsigned spellid
 }
 npc_spells {
 intunsigned id
 intunsigned parent_list
 }
 npc_spells ||--o{ bot_data : "Has-Many"
 npc_spells ||--o{ bot_spells_entries : "Has-Many"
 npc_spells ||--o{ npc_spells_entries : "Has-Many"
 npc_spells ||--o{ bot_data : "Has-Many"
 npc_spells ||--o{ bot_spells_entries : "Has-Many"
 npc_spells ||--o{ npc_spells : "One-to-One"
 npc_spells ||--o{ npc_spells_entries : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| id 
| bot_data 
| spells_id 

| Has-Many 
| id 
| bot_spells_entries 
| npc_spells_id 

| Has-Many 
| id 
| npc_spells_entries 
| npc_spells_id 

| Has-Many 
| parent_list 
| bot_data 
| spells_id 

| Has-Many 
| parent_list 
| bot_spells_entries 
| npc_spells_id 

| One-to-One 
| parent_list 
| npc_spells 
| parent_list 

| Has-Many 
| parent_list 
| npc_spells_entries 
| npc_spells_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique NPC Spell Set Identifier 

| name 
| tinytext 
| NPC Spell Set Name 

| parent_list 
| int 
| Inherit all the spells from this list, and merge them with our spells. Only one level of inheritance is allowed, so your parent's parent will not be included. 

| attack_proc 
| smallint 
| The combat proc that an NPC with this spell set will add to their list of procs. Spell Identifier 

| proc_chance 
| tinyint 
| Proc Chance: 0 = Never, 100 = Always 

| range_proc 
| smallint 
| The ranged proc that an NPC with this spell set will add to their list of procs. 

| rproc_chance 
| smallint 
| Ranged Proc Chance: 0 = Never, 100 = Always 

| defensive_proc 
| smallint 
| The defensive proc that an NPC with this spell set will add to their list of procs. 

| dproc_chance 
| smallint 
| Defensive Proc Chance: 0 = Never, 100 = Always 

| fail_recast 
| int 
| Fail Recast 

| engaged_no_sp_recast_min 
| int 
| Engaged No Spell Recast Minimum (Unused) 

| engaged_no_sp_recast_max 
| int 
| Engaged No Spell Recast Maximum (Unused) 

| engaged_b_self_chance 
| tinyint 
| Engaged B Self Chance (Unused) 

| engaged_b_other_chance 
| tinyint 
| Engaged B Other Chance (Unused) 

| engaged_d_chance 
| tinyint 
| Engaged D Chance (Unused) 

| pursue_no_sp_recast_min 
| int 
| Pursue No Spell Recast Minimum (Unused) 

| pursue_no_sp_recast_max 
| int 
| Pursue No Spell Recast Maximum (Unused) 

| pursue_d_chance 
| tinyint 
| Pursue D Chance (Unused) 

| idle_no_sp_recast_min 
| int 
| Idle No Spell Recast Minimum (Unused) 

| idle_no_sp_recast_max 
| int 
| Idle No Spell Recast Maximum (Unused) 

| idle_b_chance 
| tinyint 
| Idle B Chance (Unused)

---

## npc_spells_effects

*Source: schema/npcs/npc_spells_effects/index.html*

# npc_spells_effects¶

## Relationships¶

```
erDiagram
 npc_spells_effects {
 intunsigned id
 }
 npc_spells_effects_entries {
 int npc_spells_effects_id
 }
 npc_spells_effects ||--o{ npc_spells_effects_entries : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| id 
| npc_spells_effects_entries 
| npc_spells_effects_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Spell Effects Identifier 

| name 
| tinytext 
| Name 

| parent_list 
| int 
| Parent List

---

## npc_spells_effects_entries

*Source: schema/npcs/npc_spells_effects_entries/index.html*

# npc_spells_effects_entries¶

## Relationships¶

```
erDiagram
 npc_spells_effects_entries {
 int npc_spells_effects_id
 }
 npc_spells_effects {
 intunsigned id
 }
 npc_spells_effects_entries ||--o{ npc_spells_effects : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| npc_spells_effects_id 
| npc_spells_effects 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Spell Effect Entry Identifier 

| npc_spells_effects_id 
| int 
| NPC Spells Effects Identifier 

| spell_effect_id 
| smallint 
| Spell Effect Identifier 

| minlevel 
| tinyint 
| Minimum Level 

| maxlevel 
| tinyint 
| Maximum Level 

| se_base 
| int 
| Spell Effect Base 

| se_limit 
| int 
| Spell Effect Limit 

| se_max 
| int 
| Spell Effect Maximum

---

## npc_spells_entries

*Source: schema/npcs/npc_spells_entries/index.html*

# npc_spells_entries¶

## Relationships¶

```
erDiagram
 npc_spells_entries {
 int npc_spells_id
 smallintunsigned spellid
 }
 npc_spells {
 intunsigned id
 intunsigned parent_list
 }
 spells_new {
 int id
 int descnum
 int effectdescnum
 int effectdescnum2
 int typedescnum
 varchar teleport_zone
 }
 npc_spells_entries ||--o{ npc_spells : "One-to-One"
 npc_spells_entries ||--o{ spells_new : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| npc_spells_id 
| npc_spells 
| id 

| One-to-One 
| spellid 
| spells_new 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique NPC Spell Entry Identifier 

| npc_spells_id 
| int 
| Unique NPC Spell Set Identifier 

| spellid 
| smallint 
| Spell Identifier 

| type 
| int 
| Spell Type Bitmask 

| minlevel 
| tinyint 
| Minimum Level 

| maxlevel 
| tinyint 
| Maximum Level 

| manacost 
| smallint 
| Mana Cost 

| recast_delay 
| int 
| Recast Delay 

| priority 
| smallint 
| Priority: 0 = Innate, 1 = Highest Priority, 5 = Lower Priority, 10 = Even Lower Priority 

| resist_adjust 
| int 
| Resist Adjustment 

| min_hp 
| smallint 
| Minimum Health Percentage 

| max_hp 
| smallint 
| Maximum Health Percentage

---

## npc_types

*Source: schema/npcs/npc_types/index.html*

# npc_types¶

## Relationships¶

```
erDiagram
 npc_types {
 intunsigned alt_currency_id
 int id
 int npc_faction_id
 text name
 intunsigned loottable_id
 intunsigned merchant_id
 intunsigned emoteid
 intunsigned adventure_template_id
 intunsigned armortint_id
 intunsigned npc_spells_id
 intunsigned npc_spells_effects_id
 intunsigned trap_template
 }
 adventure_template {
 intunsigned id
 intunsigned graveyard_zone_id
 varchar zone
 smallintunsigned zone_in_zone_id
 tinyintunsigned zone_version
 varchar version
 }
 alternate_currency {
 int id
 int item_id
 }
 npc_types_tint {
 intunsigned id
 }
 npc_emotes {
 intunsigned emoteid
 }
 fishing {
 varchar content_flags
 varchar content_flags_disabled
 int Itemid
 int zoneid
 int npc_id
 }
 npc_types ||--o{ adventure_template : "One-to-One"
 npc_types ||--o{ alternate_currency : "One-to-One"
 npc_types ||--o{ npc_types_tint : "One-to-One"
 npc_types ||--o{ npc_emotes : "Has-Many"
 npc_types ||--o{ fishing : "Has-Many"

```

```
erDiagram
 npc_types {
 intunsigned alt_currency_id
 int id
 int npc_faction_id
 text name
 intunsigned loottable_id
 intunsigned merchant_id
 intunsigned emoteid
 intunsigned adventure_template_id
 intunsigned armortint_id
 intunsigned npc_spells_id
 intunsigned npc_spells_effects_id
 intunsigned trap_template
 }
 merchantlist_temp {
 intunsigned itemid
 intunsigned npcid
 }
 pets {
 int npcID
 varchar type
 int equipmentset
 }
 qs_player_handin_record {
 int char_id
 int npc_id
 }
 qs_player_npc_kill_record {
 int npc_id
 int zone_id
 }
 quest_globals {
 int charid
 varchar name
 int npcid
 int zoneid
 }
 npc_types ||--o{ merchantlist_temp : "Has-Many"
 npc_types ||--o{ pets : "One-to-One"
 npc_types ||--o{ qs_player_handin_record : "Has-Many"
 npc_types ||--o{ qs_player_npc_kill_record : "Has-Many"
 npc_types ||--o{ quest_globals : "Has-Many"

```

```
erDiagram
 npc_types {
 intunsigned alt_currency_id
 int id
 int npc_faction_id
 text name
 intunsigned loottable_id
 intunsigned merchant_id
 intunsigned emoteid
 intunsigned adventure_template_id
 intunsigned armortint_id
 intunsigned npc_spells_id
 intunsigned npc_spells_effects_id
 intunsigned trap_template
 }
 spawnentry {
 varchar content_flags
 varchar content_flags_disabled
 int npcID
 int spawngroupID
 }
 task_activities {
 intunsigned activityid
 varchar goalid
 varchar delivertonpc
 intunsigned taskid
 varchar zones
 }
 loottable {
 varchar content_flags
 varchar content_flags_disabled
 intunsigned id
 }
 merchantlist {
 varchar content_flags
 varchar content_flags_disabled
 varchar bucket_name
 int item
 varchar merchant_id
 int merchantid
 }
 horses {
 varchar filename
 }
 npc_types ||--o{ spawnentry : "Has-Many"
 npc_types ||--o{ task_activities : "Has-Many"
 npc_types ||--o{ loottable : "One-to-One"
 npc_types ||--o{ merchantlist : "Has-Many"
 npc_types ||--o{ horses : "One-to-One"

```

```
erDiagram
 npc_types {
 intunsigned alt_currency_id
 int id
 int npc_faction_id
 text name
 intunsigned loottable_id
 intunsigned merchant_id
 intunsigned emoteid
 intunsigned adventure_template_id
 intunsigned armortint_id
 intunsigned npc_spells_id
 intunsigned npc_spells_effects_id
 intunsigned trap_template
 }
 npc_faction {
 int id
 int primaryfaction
 }
 npc_spells {
 intunsigned id
 intunsigned parent_list
 }
 npc_spells_effects {
 intunsigned id
 }
 ldon_trap_templates {
 intunsigned id
 smallintunsigned spell_id
 }
 npc_types ||--o{ npc_faction : "Has-Many"
 npc_types ||--o{ npc_spells : "One-to-One"
 npc_types ||--o{ npc_spells_effects : "One-to-One"
 npc_types ||--o{ ldon_trap_templates : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| adventure_template_id 
| adventure_template 
| id 

| One-to-One 
| alt_currency_id 
| alternate_currency 
| id 

| One-to-One 
| armortint_id 
| npc_types_tint 
| id 

| Has-Many 
| emoteid 
| npc_emotes 
| emoteid 

| Has-Many 
| id 
| fishing 
| npc_id 

| Has-Many 
| id 
| merchantlist_temp 
| npcid 

| One-to-One 
| id 
| pets 
| npcID 

| Has-Many 
| id 
| qs_player_handin_record 
| npc_id 

| Has-Many 
| id 
| qs_player_npc_kill_record 
| npc_id 

| Has-Many 
| id 
| quest_globals 
| npcid 

| Has-Many 
| id 
| spawnentry 
| npcID 

| Has-Many 
| id 
| task_activities 
| delivertonpc 

| One-to-One 
| loottable_id 
| loottable 
| id 

| Has-Many 
| merchant_id 
| merchantlist 
| merchantid 

| One-to-One 
| name 
| horses 
| filename 

| Has-Many 
| npc_faction_id 
| npc_faction 
| id 

| One-to-One 
| npc_spells_id 
| npc_spells 
| id 

| One-to-One 
| npc_spells_effects_id 
| npc_spells_effects 
| id 

| One-to-One 
| trap_template 
| ldon_trap_templates 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique NPC Type Identifier 

| name 
| text 
| Name 

| lastname 
| varchar 
| Last Name 

| level 
| tinyint 
| Level 

| race 
| smallint 
| Race 

| class 
| tinyint 
| Class 

| bodytype 
| int 
| Body Type 

| hp 
| bigint 
| Health 

| mana 
| bigint 
| Mana 

| gender 
| tinyint 
| Gender 

| texture 
| tinyint 
| Texture 

| helmtexture 
| tinyint 
| Helmet Texture 

| herosforgemodel 
| int 
| Hero's Forge Model 

| size 
| float 
| Size 

| hp_regen_rate 
| bigint 
| Health Regeneration 

| hp_regen_per_second 
| bigint 
| Health Regeneration Per Second 

| mana_regen_rate 
| bigint 
| Mana Regeneration 

| loottable_id 
| int 
| Loottable Identifier 

| merchant_id 
| int 
| Merchant Identifier 

| alt_currency_id 
| int 
| Alternate Currency Identifier 

| npc_spells_id 
| int 
| NPC Spell Set Identifier 

| npc_spells_effects_id 
| int 
| NPC Spell Effects Identifier 

| npc_faction_id 
| int 
| NPC Faction Identifier 

| adventure_template_id 
| int 
| Adventure Template Identifier 

| trap_template 
| int 
| Trap Template Identifier 

| mindmg 
| int 
| Minimum Damage 

| maxdmg 
| int 
| Maximum Damage 

| attack_count 
| smallint 
| Attack Count 

| npcspecialattks 
| varchar 
| NPC Special Attacks (Deprecated) 

| special_abilities 
| text 
| NPC Special Abilities 

| aggroradius 
| int 
| Aggro Radius 

| assistradius 
| int 
| Assist Radius 

| face 
| int 
| Face 

| luclin_hairstyle 
| int 
| Hair Style 

| luclin_haircolor 
| int 
| Hair Color 

| luclin_eyecolor 
| int 
| Eye Color 1 

| luclin_eyecolor2 
| int 
| Eye Color 2 

| luclin_beardcolor 
| int 
| Beard Color 

| luclin_beard 
| int 
| Beard 

| drakkin_heritage 
| int 
| Drakkin Heritage 

| drakkin_tattoo 
| int 
| Drakkin Tattoo 

| drakkin_details 
| int 
| Drakkin Details 

| armortint_id 
| int 
| Armor Tint Identifier 

| armortint_red 
| tinyint 
| Armor Tint Red: 0 = None, 255 = Max 

| armortint_green 
| tinyint 
| Armor Tint Green: 0 = None, 255 = Max 

| armortint_blue 
| tinyint 
| Armor Tint Blue: 0 = None, 255 = Max 

| d_melee_texture1 
| int 
| Primary Weapon Texture 

| d_melee_texture2 
| int 
| Secondary Weapon Texture 

| ammo_idfile 
| varchar 
| Ammo Texture 

| prim_melee_type 
| tinyint 
| Primary Melee Type 

| sec_melee_type 
| tinyint 
| Secondary Melee Type 

| ranged_type 
| tinyint 
| Ranged Type 

| runspeed 
| float 
| Run Speed 

| MR 
| smallint 
| Magic Resistance 

| CR 
| smallint 
| Cold Resistance 

| DR 
| smallint 
| Disease Resistance 

| FR 
| smallint 
| Fire Resistance 

| PR 
| smallint 
| Poison Resistance 

| Corrup 
| smallint 
| Corruption Resistance 

| PhR 
| smallint 
| Physical Resistance 

| see_invis 
| smallint 
| See Invisible: 0 = False, 1 = True 

| see_invis_undead 
| smallint 
| See Invisible vs. Undread: 0 = False, 1 = True 

| qglobal 
| int 
| Quest Globals: 0 = Disabled, 1 = Enabled (Deprecated) 

| AC 
| smallint 
| Armor Class 

| npc_aggro 
| tinyint 
| NPC Aggro: 0 = False, 1 = True 

| spawn_limit 
| tinyint 
| Spawn Limit 

| attack_speed 
| float 
| Attack Speed: The lower the number, the faster the NPC hits. (Deprecated) 

| attack_delay 
| tinyint 
| Attack Delay: Delay between the attack arounds in 10ths of a second. 

| findable 
| tinyint 
| Findable: 0 = False, 1 = True 

| STR 
| mediumint 
| Strength 

| STA 
| mediumint 
| Stamina 

| DEX 
| mediumint 
| Dexterity 

| AGI 
| mediumint 
| Agility 

| _INT 
| mediumint 
| Intelligence 

| WIS 
| mediumint 
| Wisdom 

| CHA 
| mediumint 
| Charisma 

| see_hide 
| tinyint 
| See Hide: 0 = False, 1 = True 

| see_improved_hide 
| tinyint 
| See Improved Hide: 0 = False, 1 = True 

| trackable 
| tinyint 
| Trackable: 0 = False, 1 = True 

| isbot 
| tinyint 
| Is Bot: 0 = False, 1 = True 

| exclude 
| tinyint 
| Exclude: 0 = False, 1 = True 

| ATK 
| mediumint 
| Attack 

| Accuracy 
| mediumint 
| Accuracy 

| Avoidance 
| mediumint 
| Avoidance 

| slow_mitigation 
| smallint 
| Slow Mitigation 

| version 
| smallint 
| Version 

| maxlevel 
| tinyint 
| Maximum Level 

| scalerate 
| int 
| Scale Rate 

| private_corpse 
| tinyint 
| Private Corpse: 0 = False, 1 = True 

| unique_spawn_by_name 
| tinyint 
| Unique Spawn By Name: 0 = False, 1 = True 

| underwater 
| tinyint 
| Underwater: 0 = False, 1 = True 

| isquest 
| tinyint 
| Is Quest: 0 = False, 1 = True 

| emoteid 
| int 
| Emote Identifier 

| spellscale 
| float 
| Spell Scale: 50 = 50%, 100 = 100%, 150 = 150% 

| healscale 
| float 
| Heal Scale: 50 = 50%, 100 = 100%, 150 = 150% 

| no_target_hotkey 
| tinyint 
| No Target Hotkey: 0 = False, 1 = True 

| raid_target 
| tinyint 
| Raid Target: 0 = False, 1 = True 

| armtexture 
| tinyint 
| Arm Texture 

| bracertexture 
| tinyint 
| Bracer Texture 

| handtexture 
| tinyint 
| Hand Texture 

| legtexture 
| tinyint 
| Leg Texture 

| feettexture 
| tinyint 
| Feet Texture 

| light 
| tinyint 
| Light 

| walkspeed 
| tinyint 
| Walk Speed 

| peqid 
| int 
| PEQ Identifier 

| unique_ 
| tinyint 
| Unique 

| fixed 
| tinyint 
| Fixed 

| ignore_despawn 
| tinyint 
| Ignore Despawn: 0 = False, 1 = True 

| show_name 
| tinyint 
| Show Name: 0 = False, 1 = True 

| untargetable 
| tinyint 
| Untargetable: 0 = False, 1 = True 

| charm_ac 
| smallint 
| Charmed Armor Class 

| charm_min_dmg 
| int 
| Charmed Minimum Damage 

| charm_max_dmg 
| int 
| Charmed Maximum Damage 

| charm_attack_delay 
| tinyint 
| Charmed Attack Delay 

| charm_accuracy_rating 
| mediumint 
| Charmed Accuracy 

| charm_avoidance_rating 
| mediumint 
| Charmed Avoidance 

| charm_atk 
| mediumint 
| Charmed Attack 

| skip_global_loot 
| tinyint 
| Skip Global Loot: 0 = False, 1 = True 

| rare_spawn 
| tinyint 
| Rare Spawn: 0 = False, 1 = True 

| stuck_behavior 
| tinyint 
| Stuck Behavior 

| model 
| smallint 
| Model 

| flymode 
| tinyint 
| Fly Mode 

| always_aggro 
| tinyint 
| Aggro regardless of _int or level : 0 = False, 1 = True 

| exp_mod 
| int 
| Experience Modifier (50 = 50%, 100 = 100%, 200 = 200%) 

| heroic_strikethrough 
| int 
| Heroic Strikethrough 

| faction_amount 
| int 
| Faction Amount 

| keeps_sold_items 
| tinyint 
| Keeps Sold Items: 0 = False, 1 = True

---

## npc_types_tint

*Source: schema/npcs/npc_types_tint/index.html*

# npc_types_tint¶

## Relationships¶

```
erDiagram
 npc_types_tint {
 intunsigned id
 }
 merc_armorinfo {
 varchar armortint_id
 varchar merc_npc_type_id
 }
 npc_types {
 intunsigned alt_currency_id
 int id
 int npc_faction_id
 text name
 intunsigned loottable_id
 intunsigned merchant_id
 intunsigned emoteid
 intunsigned adventure_template_id
 intunsigned armortint_id
 intunsigned npc_spells_id
 intunsigned npc_spells_effects_id
 intunsigned trap_template
 }
 npc_types_tint ||--o{ merc_armorinfo : "Has-Many"
 npc_types_tint ||--o{ npc_types : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| id 
| merc_armorinfo 
| armortint_id 

| Has-Many 
| id 
| npc_types 
| armortint_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique NPC Type Tint Identifier 

| tint_set_name 
| text 
| Tint Set Name 

| red1h 
| tinyint 
| Red for Helmet: 0 = None, 255 = Max 

| grn1h 
| tinyint 
| Green for Helmet: 0 = None, 255 = Max 

| blu1h 
| tinyint 
| Blue for Helmet: 0 = None, 255 = Max 

| red2c 
| tinyint 
| Red for Chest: 0 = None, 255 = Max 

| grn2c 
| tinyint 
| Green for Chest: 0 = None, 255 = Max 

| blu2c 
| tinyint 
| Blue for Chest: 0 = None, 255 = Max 

| red3a 
| tinyint 
| Red for Arms: 0 = None, 255 = Max 

| grn3a 
| tinyint 
| Green for Arms: 0 = None, 255 = Max 

| blu3a 
| tinyint 
| Blue for Arms: 0 = None, 255 = Max 

| red4b 
| tinyint 
| Red for Bracers: 0 = None, 255 = Max 

| grn4b 
| tinyint 
| Green for Bracers: 0 = None, 255 = Max 

| blu4b 
| tinyint 
| Blue for Bracers: 0 = None, 255 = Max 

| red5g 
| tinyint 
| Red for Hands: 0 = None, 255 = Max 

| grn5g 
| tinyint 
| Green for Hands: 0 = None, 255 = Max 

| blu5g 
| tinyint 
| Blue for Hands: 0 = None, 255 = Max 

| red6l 
| tinyint 
| Red for Legs: 0 = None, 255 = Max 

| grn6l 
| tinyint 
| Green for Legs: 0 = None, 255 = Max 

| blu6l 
| tinyint 
| Blue for Legs: 0 = None, 255 = Max 

| red7f 
| tinyint 
| Red for Feet: 0 = None, 255 = Max 

| grn7f 
| tinyint 
| Green for Feet: 0 = None, 255 = Max 

| blu7f 
| tinyint 
| Blue for Feet: 0 = None, 255 = Max 

| red8x 
| tinyint 
| Red for Unknown: 0 = None, 255 = Max 

| grn8x 
| tinyint 
| Green for Unknown: 0 = None, 255 = Max 

| blu8x 
| tinyint 
| Blue for Unknown: 0 = None, 255 = Max 

| red9x 
| tinyint 
| Red for Unknown: 0 = None, 255 = Max 

| grn9x 
| tinyint 
| Green for Unknown: 0 = None, 255 = Max 

| blu9x 
| tinyint 
| Blue for Unknown: 0 = None, 255 = Max

---

## proximities

*Source: schema/npcs/proximities/index.html*

# proximities¶

## Relationships¶

```
erDiagram
 proximities {
 varchar zoneid
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 proximities ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| zoneid 
| zone 
| zoneidnumber 

## Schema¶

| 

Column 
| Data Type 
| Description 

| zoneid 
| int 
| Zone Identifier 

| exploreid 
| int 
| Explore Identifier 

| minx 
| float 
| Minimum X Coordinate 

| maxx 
| float 
| Maximum X Coordinate 

| miny 
| float 
| Minimum Y Coordinate 

| maxy 
| float 
| Maximum Y Coordinate 

| minz 
| float 
| Minimum Z Coordinate 

| maxz 
| float 
| Maximum Z Coordinate

---

## object

*Source: schema/objects/object/index.html*

# object¶

## Relationships¶

```
erDiagram
 object {
 varchar content_flags
 varchar content_flags_disabled
 int itemid
 int id
 smallint version
 intunsigned zoneid
 }
 content_flags {
 varchar flag_name
 }
 object_contents {
 intunsigned itemid
 intunsigned parentid
 mediumintunsigned augslot1
 mediumintunsigned augslot2
 mediumintunsigned augslot3
 mediumintunsigned augslot4
 mediumintunsigned augslot5
 mediumint augslot6
 intunsigned zoneid
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 object ||--o{ content_flags : "One-to-One"
 object ||--o{ content_flags : "One-to-One"
 object ||--o{ object_contents : "Has-Many"
 object ||--o{ items : "One-to-One"
 object ||--o{ zone : "One-to-One"
 object ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| content_flags 
| content_flags 
| flag_name 

| One-to-One 
| content_flags_disabled 
| content_flags 
| flag_name 

| Has-Many 
| id 
| object_contents 
| parentid 

| One-to-One 
| itemid 
| items 
| id 

| One-to-One 
| version 
| zone 
| version 

| One-to-One 
| zoneid 
| zone 
| zoneidnumber 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Object Identifier 

| zoneid 
| int 
| Zone Identifier 

| version 
| smallint 
| Version: -1 For All 

| xpos 
| float 
| X Coordinate 

| ypos 
| float 
| Y Coordinate 

| zpos 
| float 
| Z Coordinate 

| heading 
| float 
| Heading Coordinate 

| itemid 
| int 
| Item Identifier 

| charges 
| smallint 
| Charges 

| objectname 
| varchar 
| Object Name 

| type 
| int 
| Type 

| icon 
| int 
| Icon 

| size_percentage 
| float 
| 

| unknown24 
| int 
| Unknown 

| unknown20 
| int 
| Unknown 

| unknown64 
| int 
| Unknown 

| unknown68 
| int 
| Unknown 

| unknown72 
| int 
| Unknown 

| unknown76 
| int 
| Unknown 

| unknown84 
| int 
| Unknown 

| size 
| float 
| Size 

| solid_type 
| mediumint 
| 

| incline 
| int 
| 

| tilt_x 
| float 
| Tilt X 

| tilt_y 
| float 
| Tilt Y 

| display_name 
| varchar 
| Display Name 

| min_expansion 
| tinyint 
| Minimum Expansion 

| max_expansion 
| tinyint 
| Maximum Expansion 

| content_flags 
| varchar 
| Content Flags Required to be Enabled 

| content_flags_disabled 
| varchar 
| Content Flags Required to be Disabled

---

## object_contents

*Source: schema/objects/object_contents/index.html*

# object_contents¶

## Relationships¶

```
erDiagram
 object_contents {
 intunsigned itemid
 intunsigned parentid
 mediumintunsigned augslot1
 mediumintunsigned augslot2
 mediumintunsigned augslot3
 mediumintunsigned augslot4
 mediumintunsigned augslot5
 mediumint augslot6
 intunsigned zoneid
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 object {
 varchar content_flags
 varchar content_flags_disabled
 int itemid
 int id
 smallint version
 intunsigned zoneid
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 object_contents ||--o{ items : "One-to-One"
 object_contents ||--o{ items : "One-to-One"
 object_contents ||--o{ items : "One-to-One"
 object_contents ||--o{ items : "One-to-One"
 object_contents ||--o{ items : "One-to-One"
 object_contents ||--o{ items : "One-to-One"
 object_contents ||--o{ items : "One-to-One"
 object_contents ||--o{ object : "One-to-One"
 object_contents ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| augslot1 
| items 
| id 

| One-to-One 
| augslot2 
| items 
| id 

| One-to-One 
| augslot3 
| items 
| id 

| One-to-One 
| augslot4 
| items 
| id 

| One-to-One 
| augslot5 
| items 
| id 

| One-to-One 
| augslot6 
| items 
| id 

| One-to-One 
| itemid 
| items 
| id 

| One-to-One 
| parentid 
| object 
| id 

| One-to-One 
| zoneid 
| zone 
| zoneidnumber 

## Schema¶

| 

Column 
| Data Type 
| Description 

| zoneid 
| int 
| Zone Identifier 

| parentid 
| int 
| Object Identifier 

| bagidx 
| int 
| Bag Index 

| itemid 
| int 
| Item Identifier 

| charges 
| smallint 
| Charges 

| droptime 
| datetime 
| Drop Time 

| augslot1 
| mediumint 
| Augment Slot 1 

| augslot2 
| mediumint 
| Augment Slot 2 

| augslot3 
| mediumint 
| Augment Slot 3 

| augslot4 
| mediumint 
| Augment Slot 4 

| augslot5 
| mediumint 
| Augment Slot 5 

| augslot6 
| mediumint 
| Augment Slot 6

---

## pets

*Source: schema/pets/pets/index.html*

# pets¶

## Relationships¶

```
erDiagram
 pets {
 int npcID
 varchar type
 int equipmentset
 }
 npc_types {
 intunsigned alt_currency_id
 int id
 int npc_faction_id
 text name
 intunsigned loottable_id
 intunsigned merchant_id
 intunsigned emoteid
 intunsigned adventure_template_id
 intunsigned armortint_id
 intunsigned npc_spells_id
 intunsigned npc_spells_effects_id
 intunsigned trap_template
 }
 pets_equipmentset {
 int set_id
 }
 pets ||--o{ npc_types : "One-to-One"
 pets ||--o{ npc_types : "One-to-One"
 pets ||--o{ pets_equipmentset : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| npcID 
| npc_types 
| id 

| One-to-One 
| type 
| npc_types 
| name 

| One-to-One 
| equipmentset 
| pets_equipmentset 
| set_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Pet Identifier 

| type 
| varchar 
| NPC Type Name 

| petpower 
| int 
| Pet Power 

| npcID 
| int 
| NPC Type Identifier 

| temp 
| tinyint 
| Temporary: 0 = False, 1 = True 

| petcontrol 
| tinyint 
| Pet Control: 0 = No Control, 1 = No Attack Control, 2 = Full Control 

| petnaming 
| tinyint 
| Pet Naming: 0 = Soandsos Pet, 1 = Soandsos Familiar, 2 = Soandsos Warder, 3 = Random Naming (i.e. Gobaner), 4 = Keeps name from npc_types table 

| monsterflag 
| tinyint 
| Monster Flag: 0 = False, 1 = True 

| equipmentset 
| int 
| Pet Equipment Set Identifier

---

## pets_beastlord_data

*Source: schema/pets/pets_beastlord_data/index.html*

# pets_beastlord_data¶

## Schema¶

| 

Column 
| Data Type 
| Description 

| player_race 
| int 
| Player Race 

| pet_race 
| int 
| Race 

| texture 
| tinyint 
| Texture 

| helm_texture 
| tinyint 
| Helmet Texture 

| gender 
| tinyint 
| Gender 

| size_modifier 
| float 
| Size Modifier 

| face 
| tinyint 
| Luclin Face

---

## pets_equipmentset

*Source: schema/pets/pets_equipmentset/index.html*

# pets_equipmentset¶

## Relationships¶

```
erDiagram
 pets_equipmentset {
 int set_id
 }
 pets {
 int npcID
 varchar type
 int equipmentset
 }
 pets_equipmentset_entries {
 int item_id
 int set_id
 }
 pets_equipmentset ||--o{ pets : "Has-Many"
 pets_equipmentset ||--o{ pets_equipmentset_entries : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| set_id 
| pets 
| equipmentset 

| Has-Many 
| set_id 
| pets_equipmentset_entries 
| set_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| set_id 
| int 
| Unique Pet Equipment Set Identifier 

| setname 
| varchar 
| Pet Equipment Set Name 

| nested_set 
| int 
| Nested Set Identifier

---

## pets_equipmentset_entries

*Source: schema/pets/pets_equipmentset_entries/index.html*

# pets_equipmentset_entries¶

## Relationships¶

```
erDiagram
 pets_equipmentset_entries {
 int item_id
 int set_id
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 pets_equipmentset {
 int set_id
 }
 pets_equipmentset_entries ||--o{ items : "One-to-One"
 pets_equipmentset_entries ||--o{ pets_equipmentset : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| item_id 
| items 
| id 

| One-to-One 
| set_id 
| pets_equipmentset 
| set_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| set_id 
| int 
| Pet Equipment Set Identifier 

| slot 
| int 
| Slot 

| item_id 
| int 
| Item Identifier

---

## raid_details

*Source: schema/raids/raid_details/index.html*

# raid_details¶

## Relationships¶

```
erDiagram
 raid_details {
 int raidid
 }
 raid_leaders {
 intunsigned rid
 }
 raid_members {
 int charid
 varchar name
 int raidid
 }
 raid_details ||--o{ raid_leaders : "Has-Many"
 raid_details ||--o{ raid_members : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| raidid 
| raid_leaders 
| rid 

| Has-Many 
| raidid 
| raid_members 
| raidid 

## Schema¶

| 

Column 
| Data Type 
| Description 

| raidid 
| int 
| Unique Raid Identifier 

| loottype 
| int 
| Loot Type 

| locked 
| tinyint 
| Locked: 0 = False, 1 = True 

| motd 
| varchar 
| Message of the Day 

| marked_npc_1 
| smallint 
| Marked NPC 1 

| marked_npc_2 
| smallint 
| Marked NPC 2 

| marked_npc_1_instance_id 
| int 
| 

| marked_npc_2_entity_id 
| int 
| 

| marked_npc_2_zone_id 
| int 
| 

| marked_npc_2_instance_id 
| int 
| 

| marked_npc_3_entity_id 
| int 
| 

| marked_npc_3_zone_id 
| int 
| 

| marked_npc_3_instance_id 
| int 
|

---

## raid_leaders

*Source: schema/raids/raid_leaders/index.html*

# raid_leaders¶

## Relationships¶

```
erDiagram
 raid_leaders {
 intunsigned rid
 }
 raid_details {
 int raidid
 }
 raid_leaders ||--o{ raid_details : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| rid 
| raid_details 
| raidid 

## Schema¶

| 

Column 
| Data Type 
| Description 

| gid 
| int 
| Group Identifier 

| rid 
| int 
| Raid Identifier 

| marknpc 
| varchar 
| Mark NPC: 0 = False, 1 = True 

| maintank 
| varchar 
| Main Tank: 0 = False, 1 = True 

| assist 
| varchar 
| Assist: 0 = False, 1 = True 

| puller 
| varchar 
| Puller: 0 = False, 1 = True 

| leadershipaa 
| tinyblob 
| Leadership AA 

| mentoree 
| varchar 
| Mentoree: 0 = False, 1 = True 

| mentor_percent 
| int 
| Mentore Percent: 0 = None, 100 = Max

---

## raid_members

*Source: schema/raids/raid_members/index.html*

# raid_members¶

## Relationships¶

```
erDiagram
 raid_members {
 int charid
 varchar name
 int raidid
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 raid_details {
 int raidid
 }
 raid_members ||--o{ character_data : "One-to-One"
 raid_members ||--o{ character_data : "One-to-One"
 raid_members ||--o{ raid_details : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| charid 
| character_data 
| id 

| One-to-One 
| name 
| character_data 
| name 

| One-to-One 
| raidid 
| raid_details 
| raidid 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| bigint 
| Unique Raid Member Identifier 

| raidid 
| int 
| Raid Identifier 

| charid 
| int 
| Character Identifier 

| bot_id 
| int 
| Bot Identifier 

| groupid 
| int 
| Group Identifier 

| _class 
| tinyint 
| Class 

| level 
| tinyint 
| Level 

| name 
| varchar 
| Name 

| isgroupleader 
| tinyint 
| Is Group Leader: 0 = False, 1 = True 

| israidleader 
| tinyint 
| Is Raid Leader: 0 = False, 1 = True 

| islooter 
| tinyint 
| Is Looter: 0 = False, 1 = True 

| is_marker 
| tinyint 
| Is Marker: 0 = False, 1 = True 

| is_assister 
| tinyint 
| Is Assister: 0 = False, 1 = True 

| note 
| varchar 
| Note

---

## rule_sets

*Source: schema/rules/rule_sets/index.html*

# rule_sets¶

## Relationships¶

```
erDiagram
 rule_sets {
 tinyintunsigned ruleset_id
 }
 rule_values {
 tinyintunsigned ruleset_id
 }
 rule_sets ||--o{ rule_values : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| ruleset_id 
| rule_values 
| ruleset_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| ruleset_id 
| tinyint 
| Unique Rule Set Identifier 

| name 
| varchar 
| Name

---

## rule_values

*Source: schema/rules/rule_values/index.html*

# rule_values¶

## Relationships¶

```
erDiagram
 rule_values {
 tinyintunsigned ruleset_id
 }
 rule_sets {
 tinyintunsigned ruleset_id
 }
 rule_values ||--o{ rule_sets : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| ruleset_id 
| rule_sets 
| ruleset_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| ruleset_id 
| tinyint 
| Rule Set Identifier 

| rule_name 
| varchar 
| Rule Name 

| rule_value 
| varchar 
| Rule Value 

| notes 
| text 
| Notes

---

## respawn_times

*Source: schema/spawns/respawn_times/index.html*

# respawn_times¶

## Relationships¶

```
erDiagram
 respawn_times {
 smallint instance_id
 int id
 }
 spawn2 {
 varchar content_flags
 varchar content_flags_disabled
 int pathgrid
 int id
 int spawngroupID
 smallint version
 varchar zone
 }
 instance_list {
 int id
 tinyintunsigned version
 intunsigned zone
 }
 respawn_times ||--o{ spawn2 : "One-to-One"
 respawn_times ||--o{ instance_list : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| id 
| spawn2 
| id 

| One-to-One 
| instance_id 
| instance_list 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Respawn Time Identifier 

| start 
| int 
| Start UNIX Timestamp 

| duration 
| int 
| Duration in Seconds 

| instance_id 
| smallint 
| Instance Identifier

---

## spawn2

*Source: schema/spawns/spawn2/index.html*

# spawn2¶

## Relationships¶

```
erDiagram
 spawn2 {
 varchar content_flags
 varchar content_flags_disabled
 int pathgrid
 int id
 int spawngroupID
 smallint version
 varchar zone
 }
 content_flags {
 varchar flag_name
 }
 grid {
 int id
 int zoneid
 }
 spawngroup {
 int id
 }
 spawnentry {
 varchar content_flags
 varchar content_flags_disabled
 int npcID
 int spawngroupID
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 spawn2 ||--o{ content_flags : "One-to-One"
 spawn2 ||--o{ content_flags : "One-to-One"
 spawn2 ||--o{ grid : "One-to-One"
 spawn2 ||--o{ spawngroup : "One-to-One"
 spawn2 ||--o{ spawnentry : "Has-Many"
 spawn2 ||--o{ zone : "One-to-One"
 spawn2 ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| content_flags 
| content_flags 
| flag_name 

| One-to-One 
| content_flags_disabled 
| content_flags 
| flag_name 

| One-to-One 
| pathgrid 
| grid 
| id 

| One-to-One 
| spawngroupID 
| spawngroup 
| id 

| Has-Many 
| spawngroupID 
| spawnentry 
| spawngroupID 

| One-to-One 
| version 
| zone 
| version 

| One-to-One 
| zone 
| zone 
| short_name 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Spawn2 Entry Identifier 

| spawngroupID 
| int 
| Unique Spawngroup Identifier 

| zone 
| varchar 
| Zone Short Name 

| version 
| smallint 
| Version 

| x 
| float 
| X Coordinate 

| y 
| float 
| Y Coordinate 

| z 
| float 
| Z Coordinate 

| heading 
| float 
| Heading Coordinate 

| respawntime 
| int 
| Respawn Time in Seconds 

| variance 
| int 
| Variance in Seconds 

| pathgrid 
| int 
| Path Grid Identifier 

| path_when_zone_idle 
| tinyint 
| Path When Zone Idle: 0 = False, 1 = True 

| _condition 
| mediumint 
| Condition 

| cond_value 
| mediumint 
| Condition Value 

| animation 
| tinyint 
| Animation 

| min_expansion 
| tinyint 
| Minimum Expansion 

| max_expansion 
| tinyint 
| Maximum Expansion 

| content_flags 
| varchar 
| Content Flags Required to be Enabled 

| content_flags_disabled 
| varchar 
| Content Flags Required to be Disabled

---

## spawn_condition_values

*Source: schema/spawns/spawn_condition_values/index.html*

# spawn_condition_values¶

## Relationships¶

```
erDiagram
 spawn_condition_values {
 intunsigned instance_id
 intunsigned id
 varchar zone
 }
 spawn_conditions {
 mediumintunsigned id
 varchar zone
 }
 instance_list {
 int id
 tinyintunsigned version
 intunsigned zone
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 spawn_condition_values ||--o{ spawn_conditions : "One-to-One"
 spawn_condition_values ||--o{ instance_list : "One-to-One"
 spawn_condition_values ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| id 
| spawn_conditions 
| id 

| One-to-One 
| instance_id 
| instance_list 
| id 

| One-to-One 
| zone 
| zone 
| short_name 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Spawn Condition Identifier 

| value 
| tinyint 
| Value 

| zone 
| varchar 
| Zone Short Name 

| instance_id 
| int 
| Instance Identifier

---

## spawn_conditions

*Source: schema/spawns/spawn_conditions/index.html*

# spawn_conditions¶

## Relationships¶

```
erDiagram
 spawn_conditions {
 mediumintunsigned id
 varchar zone
 }
 spawn_condition_values {
 intunsigned instance_id
 intunsigned id
 varchar zone
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 spawn_conditions ||--o{ spawn_condition_values : "One-to-One"
 spawn_conditions ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| id 
| spawn_condition_values 
| id 

| One-to-One 
| zone 
| zone 
| short_name 

## Schema¶

| 

Column 
| Data Type 
| Description 

| zone 
| varchar 
| Zone Short Name 

| id 
| mediumint 
| Spawn Condition Identifier 

| value 
| mediumint 
| Value 

| onchange 
| tinyint 
| On Change Type 

| name 
| varchar 
| Name

---

## spawn_events

*Source: schema/spawns/spawn_events/index.html*

# spawn_events¶

## Relationships¶

```
erDiagram
 spawn_events {
 mediumintunsigned cond_id
 varchar zone
 }
 spawn_conditions {
 mediumintunsigned id
 varchar zone
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 spawn_events ||--o{ spawn_conditions : "One-to-One"
 spawn_events ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| cond_id 
| spawn_conditions 
| id 

| One-to-One 
| zone 
| zone 
| short_name 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Spawn Event Entry Identifier 

| zone 
| varchar 
| Zone Short Name 

| cond_id 
| mediumint 
| Spawn Condition Identifier 

| name 
| varchar 
| Name 

| period 
| int 
| Period 

| next_minute 
| tinyint 
| Next Minute 

| next_hour 
| tinyint 
| Next Hour 

| next_day 
| tinyint 
| Next Day 

| next_month 
| tinyint 
| Next Month 

| next_year 
| int 
| Next Year 

| enabled 
| tinyint 
| Enabled: 0 = False, 1 = True 

| action 
| tinyint 
| Action Type 

| argument 
| mediumint 
| Argument: (Based on Action) 0 = Argument Value 

| strict 
| tinyint 
| Strict Date Criteria: 0 = False, 1 = True

---

## spawnentry

*Source: schema/spawns/spawnentry/index.html*

# spawnentry¶

## Relationships¶

```
erDiagram
 spawnentry {
 varchar content_flags
 varchar content_flags_disabled
 int npcID
 int spawngroupID
 }
 content_flags {
 varchar flag_name
 }
 spawngroup {
 int id
 }
 npc_types {
 intunsigned alt_currency_id
 int id
 int npc_faction_id
 text name
 intunsigned loottable_id
 intunsigned merchant_id
 intunsigned emoteid
 intunsigned adventure_template_id
 intunsigned armortint_id
 intunsigned npc_spells_id
 intunsigned npc_spells_effects_id
 intunsigned trap_template
 }
 spawnentry ||--o{ content_flags : "One-to-One"
 spawnentry ||--o{ content_flags : "One-to-One"
 spawnentry ||--o{ spawngroup : "One-to-One"
 spawnentry ||--o{ npc_types : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| content_flags 
| content_flags 
| flag_name 

| One-to-One 
| content_flags_disabled 
| content_flags 
| flag_name 

| One-to-One 
| spawngroupID 
| spawngroup 
| id 

| One-to-One 
| npcID 
| npc_types 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| spawngroupID 
| int 
| Unique Spawn Group Identifier 

| npcID 
| int 
| NPC Type Identifier 

| chance 
| smallint 
| Chance: 0 = Never, 100 = Always 

| condition_value_filter 
| mediumint 
| Condition Value Filter 

| min_time 
| smallint 
| 

| max_time 
| smallint 
| 

| min_expansion 
| tinyint 
| Minimum Expansion 

| max_expansion 
| tinyint 
| Maximum Expansion 

| content_flags 
| varchar 
| Content Flags Required to be Enabled 

| content_flags_disabled 
| varchar 
| Content Flags Required to be Disabled

---

## spawngroup

*Source: schema/spawns/spawngroup/index.html*

# spawngroup¶

## Relationships¶

```
erDiagram
 spawngroup {
 int id
 }
 spawn2 {
 varchar content_flags
 varchar content_flags_disabled
 int pathgrid
 int id
 int spawngroupID
 smallint version
 varchar zone
 }
 spawngroup ||--o{ spawn2 : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| id 
| spawn2 
| spawngroupID 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Spawn Group Identifier 

| name 
| varchar 
| Name 

| spawn_limit 
| tinyint 
| Spawn Limit 

| dist 
| float 
| Distance 

| max_x 
| float 
| Max X Coordinate 

| min_x 
| float 
| Min X Coordinate 

| max_y 
| float 
| Max Y Coordinate 

| min_y 
| float 
| Min Y Coordinate 

| delay 
| int 
| Roaming Delay 

| mindelay 
| int 
| Minimum Delay 

| despawn 
| tinyint 
| Despawn Type 

| despawn_timer 
| int 
| Despawn Timer in Seconds 

| wp_spawns 
| tinyint 
| Waypoint Spawns: 0 = False, 1 = True

---

## auras

*Source: schema/spells/auras/index.html*

# auras¶

## Relationships¶

```
erDiagram
 auras {
 int npc_type
 int spell_id
 }
 npc_types {
 intunsigned alt_currency_id
 int id
 int npc_faction_id
 text name
 intunsigned loottable_id
 intunsigned merchant_id
 intunsigned emoteid
 intunsigned adventure_template_id
 intunsigned armortint_id
 intunsigned npc_spells_id
 intunsigned npc_spells_effects_id
 intunsigned trap_template
 }
 spells_new {
 int id
 int descnum
 int effectdescnum
 int effectdescnum2
 int typedescnum
 varchar teleport_zone
 }
 auras ||--o{ npc_types : "One-to-One"
 auras ||--o{ spells_new : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| npc_type 
| npc_types 
| id 

| One-to-One 
| spell_id 
| spells_new 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| type 
| int 
| Unique Aura Identifier 

| npc_type 
| int 
| NPC Type Identifier 

| name 
| varchar 
| Name 

| spell_id 
| int 
| Spell Identifier 

| distance 
| int 
| Distance 

| aura_type 
| int 
| Aura Type 

| spawn_type 
| int 
| Aura Spawn Type 

| movement 
| int 
| Aura Movement Type 

| duration 
| int 
| Duration 

| icon 
| int 
| Icon 

| cast_time 
| int 
| Cast Time

---

## blocked_spells

*Source: schema/spells/blocked_spells/index.html*

# blocked_spells¶

## Relationships¶

```
erDiagram
 blocked_spells {
 mediumintunsigned spellid
 int zoneid
 }
 spells_new {
 int id
 int descnum
 int effectdescnum
 int effectdescnum2
 int typedescnum
 varchar teleport_zone
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 blocked_spells ||--o{ spells_new : "One-to-One"
 blocked_spells ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| spellid 
| spells_new 
| id 

| One-to-One 
| zoneid 
| zone 
| zoneidnumber 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Blocked Spells Identifier 

| spellid 
| mediumint 
| Spell Identifier 

| type 
| tinyint 
| Blocked Spell Type 

| zoneid 
| int 
| Zone Identifier 

| x 
| float 
| X Coordinate 

| y 
| float 
| Y Coordinate 

| z 
| float 
| Z Coordinate 

| x_diff 
| float 
| X Radius 

| y_diff 
| float 
| Y Radius 

| z_diff 
| float 
| Z Radius 

| message 
| varchar 
| Message when blocked 

| description 
| varchar 
| Blocked spells description 

| min_expansion 
| tinyint 
| 

| max_expansion 
| tinyint 
| 

| content_flags 
| varchar 
| 

| content_flags_disabled 
| varchar 
|

---

## damageshieldtypes

*Source: schema/spells/damageshieldtypes/index.html*

# damageshieldtypes¶

## Relationships¶

```
erDiagram
 damageshieldtypes {
 intunsigned spellid
 }
 spells_new {
 int id
 int descnum
 int effectdescnum
 int effectdescnum2
 int typedescnum
 varchar teleport_zone
 }
 damageshieldtypes ||--o{ spells_new : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| spellid 
| spells_new 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| spellid 
| int 
| Spell Identifier 

| type 
| tinyint 
| Damage Shield Type

---

## spell_buckets

*Source: schema/spells/spell_buckets/index.html*

# spell_buckets¶

## Relationships¶

```
erDiagram
 spell_buckets {
 varchar key
 bigintunsigned spellid
 }
 spells_new {
 int id
 int descnum
 int effectdescnum
 int effectdescnum2
 int typedescnum
 varchar teleport_zone
 }
 data_buckets {
 varchar key
 }
 spell_buckets ||--o{ spells_new : "One-to-One"
 spell_buckets ||--o{ data_buckets : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| spellid 
| spells_new 
| id 

| One-to-One 
| key 
| data_buckets 
| key 

## Schema¶

| 

Column 
| Data Type 
| Description 

| spellid 
| bigint 
| Unique Spell Identifier 

| key 
| varchar 
| Data Bucket Name 

| value 
| text 
| Data Bucket Value

---

## spell_globals

*Source: schema/spells/spell_globals/index.html*

# spell_globals¶

## Relationships¶

```
erDiagram
 spell_globals {
 varchar qglobal
 int spellid
 }
 spells_new {
 int id
 int descnum
 int effectdescnum
 int effectdescnum2
 int typedescnum
 varchar teleport_zone
 }
 quest_globals {
 int charid
 varchar name
 int npcid
 int zoneid
 }
 spell_globals ||--o{ spells_new : "One-to-One"
 spell_globals ||--o{ quest_globals : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| spellid 
| spells_new 
| id 

| One-to-One 
| qglobal 
| quest_globals 
| name 

## Schema¶

| 

Column 
| Data Type 
| Description 

| spellid 
| int 
| Unique Spell Identifier 

| spell_name 
| varchar 
| Spell Name 

| qglobal 
| varchar 
| Quest Global Name 

| value 
| varchar 
| Quest Global Value

---

## spells_new

*Source: schema/spells/spells_new/index.html*

# spells_new¶

## Relationships¶

```
erDiagram
 spells_new {
 int id
 int descnum
 int effectdescnum
 int effectdescnum2
 int typedescnum
 varchar teleport_zone
 }
 db_str {
 int id
 }
 auras {
 int npc_type
 int spell_id
 }
 blocked_spells {
 mediumintunsigned spellid
 int zoneid
 }
 bot_pets {
 varchar bot_id
 varchar pets_index
 varchar spell_id
 }
 bot_pet_buffs {
 varchar pets_index
 varchar spell_id
 }
 spells_new ||--o{ db_str : "One-to-One"
 spells_new ||--o{ db_str : "One-to-One"
 spells_new ||--o{ db_str : "One-to-One"
 spells_new ||--o{ db_str : "One-to-One"
 spells_new ||--o{ auras : "One-to-One"
 spells_new ||--o{ blocked_spells : "Has-Many"
 spells_new ||--o{ bot_pets : "Has-Many"
 spells_new ||--o{ bot_pet_buffs : "Has-Many"

```

```
erDiagram
 spells_new {
 int id
 int descnum
 int effectdescnum
 int effectdescnum2
 int typedescnum
 varchar teleport_zone
 }
 bot_spells_entries {
 varchar type
 varchar npc_spells_id
 varchar spell_id
 varchar spellid
 }
 character_auras {
 int id
 int spell_id
 }
 character_buffs {
 intunsigned character_id
 smallintunsigned spell_id
 }
 character_disciplines {
 intunsigned id
 smallintunsigned disc_id
 }
 character_pet_buffs {
 int char_id
 int spell_id
 }
 spells_new ||--o{ bot_spells_entries : "Has-Many"
 spells_new ||--o{ character_auras : "Has-Many"
 spells_new ||--o{ character_buffs : "Has-Many"
 spells_new ||--o{ character_disciplines : "Has-Many"
 spells_new ||--o{ character_pet_buffs : "Has-Many"

```

```
erDiagram
 spells_new {
 int id
 int descnum
 int effectdescnum
 int effectdescnum2
 int typedescnum
 varchar teleport_zone
 }
 character_pet_info {
 int char_id
 int spell_id
 }
 character_spells {
 intunsigned id
 smallintunsigned spell_id
 }
 damageshieldtypes {
 intunsigned spellid
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 ldon_trap_templates {
 intunsigned id
 smallintunsigned spell_id
 }
 spells_new ||--o{ character_pet_info : "Has-Many"
 spells_new ||--o{ character_spells : "Has-Many"
 spells_new ||--o{ damageshieldtypes : "Has-Many"
 spells_new ||--o{ items : "Has-Many"
 spells_new ||--o{ items : "Has-Many"
 spells_new ||--o{ items : "Has-Many"
 spells_new ||--o{ items : "Has-Many"
 spells_new ||--o{ items : "Has-Many"
 spells_new ||--o{ items : "Has-Many"
 spells_new ||--o{ ldon_trap_templates : "Has-Many"

```

```
erDiagram
 spells_new {
 int id
 int descnum
 int effectdescnum
 int effectdescnum2
 int typedescnum
 varchar teleport_zone
 }
 merc_spell_list_entries {
 varchar merc_spell_list_id
 varchar spell_id
 varchar stance_id
 }
 npc_spells_entries {
 int npc_spells_id
 smallintunsigned spellid
 }
 spell_buckets {
 varchar key
 bigintunsigned spellid
 }
 spell_globals {
 varchar qglobal
 int spellid
 }
 spells_new ||--o{ merc_spell_list_entries : "Has-Many"
 spells_new ||--o{ npc_spells_entries : "Has-Many"
 spells_new ||--o{ spell_buckets : "Has-Many"
 spells_new ||--o{ spell_globals : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| descnum 
| db_str 
| id 

| One-to-One 
| effectdescnum 
| db_str 
| id 

| One-to-One 
| effectdescnum2 
| db_str 
| id 

| One-to-One 
| typedescnum 
| db_str 
| id 

| One-to-One 
| id 
| auras 
| spell_id 

| Has-Many 
| id 
| blocked_spells 
| spellid 

| Has-Many 
| id 
| bot_pets 
| spell_id 

| Has-Many 
| id 
| bot_pet_buffs 
| spell_id 

| Has-Many 
| id 
| bot_spells_entries 
| spellid 

| Has-Many 
| id 
| character_auras 
| spell_id 

| Has-Many 
| id 
| character_buffs 
| spell_id 

| Has-Many 
| id 
| character_disciplines 
| disc_id 

| Has-Many 
| id 
| character_pet_buffs 
| spell_id 

| Has-Many 
| id 
| character_pet_info 
| spell_id 

| Has-Many 
| id 
| character_spells 
| spell_id 

| Has-Many 
| id 
| damageshieldtypes 
| spellid 

| Has-Many 
| id 
| items 
| bardeffect 

| Has-Many 
| id 
| items 
| clickeffect 

| Has-Many 
| id 
| items 
| focuseffect 

| Has-Many 
| id 
| items 
| proceffect 

| Has-Many 
| id 
| items 
| scrolleffect 

| Has-Many 
| id 
| items 
| worneffect 

| Has-Many 
| id 
| ldon_trap_templates 
| spell_id 

| Has-Many 
| id 
| merc_spell_list_entries 
| spell_id 

| Has-Many 
| id 
| npc_spells_entries 
| spellid 

| Has-Many 
| id 
| spell_buckets 
| spellid 

| Has-Many 
| id 
| spell_globals 
| spellid 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Spell Identifier 

| name 
| varchar 
| Name 

| player_1 
| varchar 
| Player_1 

| teleport_zone 
| varchar 
| The zone you are teleporting to or the NPC Name you want to spawn. 

| you_cast 
| varchar 
| The message sent to others when you cast the spell. 

| other_casts 
| varchar 
| The message seen when someone around you casts the spell. 

| cast_on_you 
| varchar 
| The message received when the spell is cast on you. 

| cast_on_other 
| varchar 
| The message recieved when the spell is cast on another. 

| spell_fades 
| varchar 
| The message recieved when the spell fades. 

| range 
| int 
| Range 

| aoerange 
| int 
| Area of Effect Range 

| pushback 
| int 
| Push Back 

| pushup 
| int 
| Push Up 

| cast_time 
| int 
| Cast Time in Milliseconds 

| recovery_time 
| int 
| Recovery Time in Seconds 

| recast_time 
| int 
| Recast Time in Seconds 

| buffdurationformula 
| int 
| Buff Duration Formula 

| buffduration 
| int 
| Buff Duration 

| AEDuration 
| int 
| Area of Effect Duration 

| mana 
| int 
| Mana Cost 

| effect_base_value1 
| int 
| Effect Base Value 1 

| effect_base_value2 
| int 
| Effect Base Value 2 

| effect_base_value3 
| int 
| Effect Base Value 3 

| effect_base_value4 
| int 
| Effect Base Value 4 

| effect_base_value5 
| int 
| Effect Base Value 5 

| effect_base_value6 
| int 
| Effect Base Value 6 

| effect_base_value7 
| int 
| Effect Base Value 7 

| effect_base_value8 
| int 
| Effect Base Value 8 

| effect_base_value9 
| int 
| Effect Base Value 9 

| effect_base_value10 
| int 
| Effect Base Value 10 

| effect_base_value11 
| int 
| Effect Base Value 11 

| effect_base_value12 
| int 
| Effect Base Value 12 

| effect_limit_value1 
| int 
| Effect Limit Value 1 

| effect_limit_value2 
| int 
| Effect Limit Value 2 

| effect_limit_value3 
| int 
| Effect Limit Value 3 

| effect_limit_value4 
| int 
| Effect Limit Value 4 

| effect_limit_value5 
| int 
| Effect Limit Value 5 

| effect_limit_value6 
| int 
| Effect Limit Value 6 

| effect_limit_value7 
| int 
| Effect Limit Value 7 

| effect_limit_value8 
| int 
| Effect Limit Value 8 

| effect_limit_value9 
| int 
| Effect Limit Value 9 

| effect_limit_value10 
| int 
| Effect Limit Value 10 

| effect_limit_value11 
| int 
| Effect Limit Value 11 

| effect_limit_value12 
| int 
| Effect Limit Value 12 

| max1 
| int 
| Max 1 

| max2 
| int 
| Max 2 

| max3 
| int 
| Max 3 

| max4 
| int 
| Max 4 

| max5 
| int 
| Max 5 

| max6 
| int 
| Max 6 

| max7 
| int 
| Max 7 

| max8 
| int 
| Max 8 

| max9 
| int 
| Max 9 

| max10 
| int 
| Max 10 

| max11 
| int 
| Max 11 

| max12 
| int 
| Max 12 

| icon 
| int 
| Icon 

| memicon 
| int 
| Memmed Icon 

| components1 
| int 
| Item Identifier 

| components2 
| int 
| Item Identifier 

| components3 
| int 
| Item Identifier 

| components4 
| int 
| Item Identifier 

| component_counts1 
| int 
| Component Count 1 

| component_counts2 
| int 
| Component Count 2 

| component_counts3 
| int 
| Component Count 3 

| component_counts4 
| int 
| Component Count 4 

| NoexpendReagent1 
| int 
| If it is a number between 1-4 it means component number 1-4 is a focus and not to expend it. If it is a valid item ID it means this item is a focus as well. 

| NoexpendReagent2 
| int 
| If it is a number between 1-4 it means component number 1-4 is a focus and not to expend it. If it is a valid item ID it means this item is a focus as well. 

| NoexpendReagent3 
| int 
| If it is a number between 1-4 it means component number 1-4 is a focus and not to expend it. If it is a valid item ID it means this item is a focus as well. 

| NoexpendReagent4 
| int 
| If it is a number between 1-4 it means component number 1-4 is a focus and not to expend it. If it is a valid item ID it means this item is a focus as well. 

| formula1 
| int 
| Formula 1 

| formula2 
| int 
| Formula 2 

| formula3 
| int 
| Formula 3 

| formula4 
| int 
| Formula 4 

| formula5 
| int 
| Formula 5 

| formula6 
| int 
| Formula 6 

| formula7 
| int 
| Formula 7 

| formula8 
| int 
| Formula 8 

| formula9 
| int 
| Formula 9 

| formula10 
| int 
| Formula 10 

| formula11 
| int 
| Formula 11 

| formula12 
| int 
| Formula 12 

| LightType 
| int 
| Light Type 

| goodEffect 
| int 
| Good Effect: 0 = Detrimental, 1 = Beneficial, 2 = Beneficial Group Only 

| Activated 
| int 
| Activated 

| resisttype 
| int 
| Resist Type 

| effectid1 
| int 
| Effect Identifier 1 

| effectid2 
| int 
| Effect Identifier 2 

| effectid3 
| int 
| Effect Identifier 3 

| effectid4 
| int 
| Effect Identifier 4 

| effectid5 
| int 
| Effect Identifier 5 

| effectid6 
| int 
| Effect Identifier 6 

| effectid7 
| int 
| Effect Identifier 7 

| effectid8 
| int 
| Effect Identifier 8 

| effectid9 
| int 
| Effect Identifier 9 

| effectid10 
| int 
| Effect Identifier 10 

| effectid11 
| int 
| Effect Identifier 11 

| effectid12 
| int 
| Effect Identifier 12 

| targettype 
| int 
| Target Type 

| basediff 
| int 
| Base Difficult Fizzle Adjustment 

| skill 
| int 
| Skill Identifier 

| zonetype 
| int 
| Zone Type 

| EnvironmentType 
| int 
| Environment Type 

| TimeOfDay 
| int 
| Time of Day Type 

| classes1 
| int 
| Required Level for Warrior 

| classes2 
| int 
| Required Level for Cleric 

| classes3 
| int 
| Required Level for Paladin 

| classes4 
| int 
| Required Level for Ranger 

| classes5 
| int 
| Required Level for Shadow Knight 

| classes6 
| int 
| Required Level for Druid 

| classes7 
| int 
| Required Level for Monk 

| classes8 
| int 
| Required Level for Bard 

| classes9 
| int 
| Required Level for Rogue 

| classes10 
| int 
| Required Level for Shaman 

| classes11 
| int 
| Required Level for Necromancer 

| classes12 
| int 
| Required Level for Wizard 

| classes13 
| int 
| Required Level for Magician 

| classes14 
| int 
| Required Level for Enchanter 

| classes15 
| int 
| Required Level for Beastlord 

| classes16 
| int 
| Required Level for Berserker 

| CastingAnim 
| int 
| Casting Animation 

| TargetAnim 
| int 
| Target Animation 

| TravelType 
| int 
| Travel Type (Unused) 

| SpellAffectIndex 
| int 
| Spell Affect Index 

| disallow_sit 
| int 
| Disallow Sit: 0 = False, 1 = True 

| deities0 
| int 
| Deity List 

| deities1 
| int 
| Deity List 

| deities2 
| int 
| Deity List 

| deities3 
| int 
| Deity List 

| deities4 
| int 
| Deity List 

| deities5 
| int 
| Deity List 

| deities6 
| int 
| Deity List 

| deities7 
| int 
| Deity List 

| deities8 
| int 
| Deity List 

| deities9 
| int 
| Deity List 

| deities10 
| int 
| Deity List 

| deities11 
| int 
| Deity List 

| deities12 
| int 
| Deity List 

| deities13 
| int 
| Deity List 

| deities14 
| int 
| Deity List 

| deities15 
| int 
| Deity List 

| deities16 
| int 
| Deity List 

| field142 
| int 
| Unknown 

| field143 
| int 
| Unknown 

| new_icon 
| int 
| New Icon 

| spellanim 
| int 
| Spell Animation 

| uninterruptable 
| int 
| Uninterruptable: 0 = False, 1 = True 

| ResistDiff 
| int 
| Resist Difference 

| dot_stacking_exempt 
| int 
| Damage Over Time Stacking Exempt: 0 = False, 1 = True 

| deleteable 
| int 
| Deleteable: 0 = False, 1 = True 

| RecourseLink 
| int 
| Recourse Spell Identifier 

| no_partial_resist 
| int 
| No Partial Resist: 0 = False, 1 = True 

| field152 
| int 
| Unknown 

| field153 
| int 
| Unknown 

| short_buff_box 
| int 
| Short Buff Box: 0 = False, 1 = True 

| descnum 
| int 
| Description Number 

| typedescnum 
| int 
| Type Description Number 

| effectdescnum 
| int 
| Effect Description Number 

| effectdescnum2 
| int 
| Effect Description Number 2 

| npc_no_los 
| int 
| NPC No Line of Sight: 0 = False, 1 = True 

| field160 
| int 
| Unknown 

| reflectable 
| int 
| Reflectable: 0 = False, 1 = True 

| bonushate 
| int 
| Bonus Hate 

| field163 
| int 
| Unknown 

| field164 
| int 
| Unknown 

| ldon_trap 
| int 
| LDoN Trap Identifier 

| EndurCost 
| int 
| Endurance Cost 

| EndurTimerIndex 
| int 
| Endurance Timer 

| IsDiscipline 
| int 
| Is Discipline: 0 = False, 1 = True 

| field169 
| int 
| Unknown 

| field170 
| int 
| Unknown 

| field171 
| int 
| Unknown 

| field172 
| int 
| Unknown 

| HateAdded 
| int 
| Hate Added 

| EndurUpkeep 
| int 
| Endurance Upkeep 

| numhitstype 
| int 
| Number of Hits Type 

| numhits 
| int 
| Number of Hits 

| pvpresistbase 
| int 
| PVP Resist Base 

| pvpresistcalc 
| int 
| PVP Resist Calc 

| pvpresistcap 
| int 
| PVP Resist Cap 

| spell_category 
| int 
| Spell Category 

| pvp_duration 
| int 
| PVP Duration 

| pvp_duration_cap 
| int 
| PVP Duration Cap 

| pcnpc_only_flag 
| int 
| PC/NPC Only Flag: 0 = Not Applicable, 1 = PCs and Mercs, 2 = NPCs 

| cast_not_standing 
| int 
| Cast Not Standing: 0 = False, 1 = True 

| can_mgb 
| int 
| Can Mass Group Buff: 0 = False, 1 = True 

| nodispell 
| int 
| No Dispell: 0 = False, 1 = True 

| npc_category 
| int 
| NPC Spell Category Identifier 

| npc_usefulness 
| int 
| NPC Usefulness 

| MinResist 
| int 
| Minimum Resistance 

| MaxResist 
| int 
| Maximum Resistance 

| viral_targets 
| int 
| Viral Targets 

| viral_timer 
| int 
| Viral Timer 

| nimbuseffect 
| int 
| Nimbus Effect 

| ConeStartAngle 
| int 
| Cone Start Angle 

| ConeStopAngle 
| int 
| Cone Stop Angle 

| sneaking 
| int 
| Sneaking: 0 = False, 1 = True 

| not_extendable 
| int 
| Not Extendable: 0 = False, 1 = True 

| field198 
| int 
| Unknown 

| field199 
| int 
| Unknown 

| suspendable 
| int 
| Suspendable: 0 = False, 1 = True 

| viral_range 
| int 
| Viral Range 

| songcap 
| int 
| Song Cap 

| field203 
| int 
| Unknown 

| field204 
| int 
| Unknown 

| no_block 
| int 
| No Block: 0 = False, 1 = True 

| field206 
| int 
| Unknown 

| spellgroup 
| int 
| Spell Group 

| rank 
| int 
| Rank 

| field209 
| int 
| Unknown 

| field210 
| int 
| Unknown 

| CastRestriction 
| int 
| Cast Restrictions 

| allowrest 
| int 
| Allow Rest: 0 = False, 1 = True 

| InCombat 
| int 
| In Combat: 0 = False, 1 = True 

| OutofCombat 
| int 
| Out Of Combat: 0 = False, 1 = True 

| field215 
| int 
| Unknown 

| field216 
| int 
| Unknown 

| field217 
| int 
| Unknown 

| aemaxtargets 
| int 
| Area of Effect Max Targets 

| maxtargets 
| int 
| Max Targets 

| field220 
| int 
| Unknown 

| field221 
| int 
| Unknown 

| field222 
| int 
| Unknown 

| field223 
| int 
| Unknown 

| persistdeath 
| int 
| Persist Death: 0 = False, 1 = True 

| field225 
| int 
| Unknown 

| field226 
| int 
| Unknown 

| min_dist 
| float 
| Minimum Distance 

| min_dist_mod 
| float 
| Minimum Distance Modifier 

| max_dist 
| float 
| Maximum Distance 

| max_dist_mod 
| float 
| Maximum Distance Modifier 

| min_range 
| int 
| Minimum Range 

| field232 
| int 
| Unknown 

| field233 
| int 
| Unknown 

| field234 
| int 
| Unknown 

| field235 
| int 
| Unknown 

| field236 
| int 
| Unknown

---

## completed_shared_task_activity_state

*Source: schema/tasks/completed_shared_task_activity_state/index.html*

# completed_shared_task_activity_state¶

## Relationships¶

```
erDiagram
 completed_shared_task_activity_state {
 int activity_id
 bigint shared_task_id
 }
 task_activities {
 intunsigned activityid
 varchar goalid
 varchar delivertonpc
 intunsigned taskid
 varchar zones
 }
 shared_tasks {
 bigint id
 int task_id
 }
 completed_shared_task_activity_state ||--o{ task_activities : "One-to-One"
 completed_shared_task_activity_state ||--o{ shared_tasks : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| activity_id 
| task_activities 
| activityid 

| One-to-One 
| shared_task_id 
| shared_tasks 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| shared_task_id 
| bigint 
| Shared Task Identifier 

| activity_id 
| int 
| Activity Identifier 

| done_count 
| int 
| Done Count 

| updated_time 
| datetime 
| Updated Time 

| completed_time 
| datetime 
| Completed Time

---

## completed_shared_task_members

*Source: schema/tasks/completed_shared_task_members/index.html*

# completed_shared_task_members¶

## Relationships¶

```
erDiagram
 completed_shared_task_members {
 bigint character_id
 bigint shared_task_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 shared_tasks {
 bigint id
 int task_id
 }
 completed_shared_task_members ||--o{ character_data : "One-to-One"
 completed_shared_task_members ||--o{ shared_tasks : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| character_id 
| character_data 
| id 

| One-to-One 
| shared_task_id 
| shared_tasks 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| shared_task_id 
| bigint 
| Shared Task Identifier 

| character_id 
| bigint 
| Character Identifier 

| is_leader 
| tinyint 
| Is Leader: 0 = False, 1 = True

---

## completed_shared_tasks

*Source: schema/tasks/completed_shared_tasks/index.html*

# completed_shared_tasks¶

## Relationships¶

```
erDiagram
 completed_shared_tasks {
 int task_id
 }
 tasks {
 intunsigned id
 tinyint type
 intunsigned dz_template_id
 }
 completed_shared_tasks ||--o{ tasks : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| task_id 
| tasks 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| bigint 
| Shared Task Identifier 

| task_id 
| int 
| Shared Task Identifier 

| accepted_time 
| datetime 
| Accepted Time 

| expire_time 
| datetime 
| Expire TIme 

| completion_time 
| datetime 
| Completion TIme 

| is_locked 
| tinyint 
| Is Locked: 0 = False, 1 = True

---

## completed_tasks

*Source: schema/tasks/completed_tasks/index.html*

# completed_tasks¶

## Relationships¶

```
erDiagram
 completed_tasks {
 intunsigned charid
 intunsigned taskid
 int activityid
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 tasks {
 intunsigned id
 tinyint type
 intunsigned dz_template_id
 }
 task_activities {
 intunsigned activityid
 varchar goalid
 varchar delivertonpc
 intunsigned taskid
 varchar zones
 }
 completed_tasks ||--o{ character_data : "One-to-One"
 completed_tasks ||--o{ tasks : "One-to-One"
 completed_tasks ||--o{ task_activities : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| charid 
| character_data 
| id 

| One-to-One 
| taskid 
| tasks 
| id 

| One-to-One 
| activityid 
| task_activities 
| activityid 

## Schema¶

| 

Column 
| Data Type 
| Description 

| charid 
| int 
| Character Identifier 

| completedtime 
| int 
| Completed Time UNIX Timestamp 

| taskid 
| int 
| Task Identifier 

| activityid 
| int 
| Activity Identifier

---

## goallists

*Source: schema/tasks/goallists/index.html*

# goallists¶

## Relationships¶

```
erDiagram
 goallists {
 varchar listid
 }
 task_activities {
 intunsigned activityid
 varchar goalid
 varchar delivertonpc
 intunsigned taskid
 varchar zones
 }
 goallists ||--o{ task_activities : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| listid 
| task_activities 
| goalid 

## Schema¶

| 

Column 
| Data Type 
| Description 

| listid 
| int 
| Goal List Identifier 

| entry 
| int 
| Entry Identifier

---

## shared_task_activity_state

*Source: schema/tasks/shared_task_activity_state/index.html*

# shared_task_activity_state¶

## Relationships¶

```
erDiagram
 shared_task_activity_state {
 int activity_id
 bigint shared_task_id
 }
 task_activities {
 intunsigned activityid
 varchar goalid
 varchar delivertonpc
 intunsigned taskid
 varchar zones
 }
 shared_tasks {
 bigint id
 int task_id
 }
 shared_task_activity_state ||--o{ task_activities : "One-to-One"
 shared_task_activity_state ||--o{ shared_tasks : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| activity_id 
| task_activities 
| activityid 

| One-to-One 
| shared_task_id 
| shared_tasks 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| shared_task_id 
| bigint 
| Shared Task Identifier 

| activity_id 
| int 
| Activity Identifier 

| done_count 
| int 
| Done Count 

| updated_time 
| datetime 
| Updated Time 

| completed_time 
| datetime 
| Completed Time

---

## shared_task_dynamic_zones

*Source: schema/tasks/shared_task_dynamic_zones/index.html*

# shared_task_dynamic_zones¶

## Relationships¶

```
erDiagram
 shared_task_dynamic_zones {
 intunsigned dynamic_zone_id
 bigint shared_task_id
 }
 dynamic_zones {
 int dz_switch_id
 intunsigned id
 intunsigned compass_zone_id
 int instance_id
 intunsigned safe_return_zone_id
 }
 shared_tasks {
 bigint id
 int task_id
 }
 shared_task_dynamic_zones ||--o{ dynamic_zones : "One-to-One"
 shared_task_dynamic_zones ||--o{ shared_tasks : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| dynamic_zone_id 
| dynamic_zones 
| id 

| One-to-One 
| shared_task_id 
| shared_tasks 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| shared_task_id 
| bigint 
| Shared Task Identifier 

| dynamic_zone_id 
| int 
| Dynamic Zone Identifier

---

## shared_task_members

*Source: schema/tasks/shared_task_members/index.html*

# shared_task_members¶

## Relationships¶

```
erDiagram
 shared_task_members {
 bigint character_id
 bigint shared_task_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 shared_tasks {
 bigint id
 int task_id
 }
 shared_task_members ||--o{ character_data : "One-to-One"
 shared_task_members ||--o{ shared_tasks : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| character_id 
| character_data 
| id 

| One-to-One 
| shared_task_id 
| shared_tasks 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| shared_task_id 
| bigint 
| Shared Task Identifier 

| character_id 
| bigint 
| Character Identifier 

| is_leader 
| tinyint 
| Is Leader: 0 = False, 1 = True

---

## shared_tasks

*Source: schema/tasks/shared_tasks/index.html*

# shared_tasks¶

## Relationships¶

```
erDiagram
 shared_tasks {
 bigint id
 int task_id
 }
 shared_task_activity_state {
 int activity_id
 bigint shared_task_id
 }
 shared_task_dynamic_zones {
 intunsigned dynamic_zone_id
 bigint shared_task_id
 }
 shared_task_members {
 bigint character_id
 bigint shared_task_id
 }
 tasks {
 intunsigned id
 tinyint type
 intunsigned dz_template_id
 }
 shared_tasks ||--o{ shared_task_activity_state : "Has-Many"
 shared_tasks ||--o{ shared_task_dynamic_zones : "Has-Many"
 shared_tasks ||--o{ shared_task_members : "Has-Many"
 shared_tasks ||--o{ tasks : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| id 
| shared_task_activity_state 
| shared_task_id 

| Has-Many 
| id 
| shared_task_dynamic_zones 
| shared_task_id 

| Has-Many 
| id 
| shared_task_members 
| shared_task_id 

| One-to-One 
| task_id 
| tasks 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| bigint 
| Unique Shared Task Identifier 

| task_id 
| int 
| Task Identifier 

| accepted_time 
| datetime 
| Accepted Time 

| expire_time 
| datetime 
| Expire Time 

| completion_time 
| datetime 
| Completion Time 

| is_locked 
| tinyint 
| Is Locked: 0 = False, 1 = True

---

## task_activities

*Source: schema/tasks/task_activities/index.html*

# task_activities¶

## Relationships¶

```
erDiagram
 task_activities {
 intunsigned activityid
 varchar goalid
 varchar delivertonpc
 intunsigned taskid
 varchar zones
 }
 npc_types {
 intunsigned alt_currency_id
 int id
 int npc_faction_id
 text name
 intunsigned loottable_id
 intunsigned merchant_id
 intunsigned emoteid
 intunsigned adventure_template_id
 intunsigned armortint_id
 intunsigned npc_spells_id
 intunsigned npc_spells_effects_id
 intunsigned trap_template
 }
 goallists {
 varchar listid
 }
 tasks {
 intunsigned id
 tinyint type
 intunsigned dz_template_id
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 task_activities ||--o{ npc_types : "One-to-One"
 task_activities ||--o{ goallists : "Has-Many"
 task_activities ||--o{ tasks : "One-to-One"
 task_activities ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| delivertonpc 
| npc_types 
| id 

| Has-Many 
| goalid 
| goallists 
| listid 

| One-to-One 
| taskid 
| tasks 
| id 

| One-to-One 
| zones 
| zone 
| zoneidnumber 

## Schema¶

| 

Column 
| Data Type 
| Description 

| taskid 
| int 
| Task Identifier 

| activityid 
| int 
| Activity Identifier: Starts at 0 

| req_activity_id 
| int 
| Required Activity Identifier 

| step 
| int 
| Step: 0 = Always Available, >0 = Must Complete Previous 

| activitytype 
| tinyint 
| Activity Type 

| target_name 
| varchar 
| Target Name 

| goalmethod 
| int 
| Goal Method: 0 = Single Value, 1 = List 

| goalcount 
| int 
| Goal Count 

| description_override 
| varchar 
| Description Override 

| goalid 
| int 
| Goal Identifier or Goal List Identifier 

| goal_match_list 
| text 
| Goal Match List: Pipe ( 

| item_list 
| varchar 
| Item Identifier List 

| dz_switch_id 
| int 
| Dynamic Zone Switch ID 

| min_x 
| float 
| Minimum X Coordinate 

| min_y 
| float 
| Minimum Y Coordinate 

| min_z 
| float 
| Minimum Z Coordinate 

| max_x 
| float 
| Maximum X Coordinate 

| max_y 
| float 
| Maximum Y Coordinate 

| max_z 
| float 
| Maximum Z Coordinate 

| skill_list 
| varchar 
| Skill Identifier List 

| spell_list 
| varchar 
| Spell Identifier List 

| zones 
| varchar 
| Zones List 

| zone_version 
| int 
| Zone Version 

| optional 
| tinyint 
| Optional: 0 = False, 1 = True 

| list_group 
| tinyint 
|

---

## tasks

*Source: schema/tasks/tasks/index.html*

# tasks¶

## Relationships¶

```
erDiagram
 tasks {
 intunsigned id
 tinyint type
 intunsigned dz_template_id
 }
 task_activities {
 intunsigned activityid
 varchar goalid
 varchar delivertonpc
 intunsigned taskid
 varchar zones
 }
 tasksets {
 intunsigned taskid
 }
 character_tasks {
 intunsigned charid
 intunsigned taskid
 tinyint type
 }
 dynamic_zone_templates {
 intunsigned id
 }
 tasks ||--o{ task_activities : "Has-Many"
 tasks ||--o{ tasksets : "Has-Many"
 tasks ||--o{ character_tasks : "Has-Many"
 tasks ||--o{ dynamic_zone_templates : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| id 
| task_activities 
| taskid 

| Has-Many 
| id 
| tasksets 
| taskid 

| Has-Many 
| type 
| character_tasks 
| type 

| One-to-One 
| dz_template_id 
| dynamic_zone_templates 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Task Identifier 

| type 
| tinyint 
| Task Type 

| duration 
| int 
| Duration 

| duration_code 
| tinyint 
| Duration Code 

| title 
| varchar 
| Title 

| description 
| text 
| Description 

| reward 
| varchar 
| Reward Description 

| rewardid 
| int 
| Reward Item Identifier 

| cash_reward 
| int 
| Cash Reward in Copper 

| xpreward 
| int 
| Experience Reward 

| rewardmethod 
| tinyint 
| Reward Method: 0 = Single Item ID, 1 = List of Items, 2 = Quest Controlled 

| reward_points 
| int 
| Reward Points 

| reward_point_type 
| int 
| Reward Point Type: 4 = Radiant, 5 = Ebon 

| min_level 
| tinyint 
| Minimum Level 

| max_level 
| tinyint 
| Maximum Level 

| level_spread 
| int 
| Level Spread 

| min_players 
| int 
| Minimum Players 

| max_players 
| int 
| Maximum Players 

| repeatable 
| tinyint 
| Repeatable: 0 = False, 1 = True 

| faction_reward 
| int 
| Faction Reward 

| completion_emote 
| varchar 
| Completion Emote 

| replay_timer_group 
| int 
| Group Replay Timer in Seconds 

| replay_timer_seconds 
| int 
| Replay Timer in Seconds 

| request_timer_group 
| int 
| Group Request Timer in Seconds 

| request_timer_seconds 
| int 
| Request Timer in Seconds 

| dz_template_id 
| int 
| Dynamic Zone Template Identifier 

| lock_activity_id 
| int 
| Lock Activity Identifier 

| faction_amount 
| int 
| Faction Amount 

| enabled 
| smallint 
|

---

## tasksets

*Source: schema/tasks/tasksets/index.html*

# tasksets¶

## Relationships¶

```
erDiagram
 tasksets {
 intunsigned taskid
 }
 tasks {
 intunsigned id
 tinyint type
 intunsigned dz_template_id
 }
 tasksets ||--o{ tasks : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| taskid 
| tasks 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Task Set Entry Identifier 

| taskid 
| int 
| Task Identifier

---

## timers

*Source: schema/timers/timers/index.html*

# timers¶

## Relationships¶

```
erDiagram
 timers {
 int char_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 timers ||--o{ character_data : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| char_id 
| character_data 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| char_id 
| int 
| Unique Character Identifier 

| type 
| mediumint 
| Type 

| start 
| int 
| Start UNIX Timestamp 

| duration 
| int 
| Duration 

| enable 
| tinyint 
| Enabled: 0 = False, 1 = True

---

## titles

*Source: schema/titles/titles/index.html*

# titles¶

## Relationships¶

```
erDiagram
 titles {
 int char_id
 int title_set
 int item_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 player_titlesets {
 intunsigned char_id
 intunsigned title_set
 }
 titles ||--o{ character_data : "One-to-One"
 titles ||--o{ items : "One-to-One"
 titles ||--o{ player_titlesets : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| char_id 
| character_data 
| id 

| One-to-One 
| item_id 
| items 
| id 

| Has-Many 
| title_set 
| player_titlesets 
| title_set 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Title Identifier 

| skill_id 
| tinyint 
| Skill Identifier 

| min_skill_value 
| mediumint 
| Minimum Skill Value 

| max_skill_value 
| mediumint 
| Maximum Skill Value 

| min_aa_points 
| mediumint 
| Minimum AA Points 

| max_aa_points 
| mediumint 
| Maximum AA Points 

| class 
| tinyint 
| Class 

| gender 
| tinyint 
| Gender 

| char_id 
| int 
| Unique Character Identifier 

| status 
| int 
| Required Status 

| item_id 
| int 
| Item Identifier 

| prefix 
| varchar 
| Prefix 

| suffix 
| varchar 
| Suffix 

| title_set 
| int 
| Title Set Identifier

---

## tool_game_objects

*Source: schema/tools/tool_game_objects/index.html*

# tool_game_objects¶

## Relationships¶

```
erDiagram
 tool_game_objects {
 int zoneid
 varchar zonesn
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 tool_game_objects ||--o{ zone : "One-to-One"
 tool_game_objects ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| zoneid 
| zone 
| zoneidnumber 

| One-to-One 
| zonesn 
| zone 
| short_name 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Tool Game Object Identifier 

| zoneid 
| int 
| Zone Identifier 

| zonesn 
| varchar 
| Zone Short Name 

| object_name 
| varchar 
| Object Name 

| file_from 
| varchar 
| File From 

| is_global 
| tinyint 
| Is Global: 0 = False, 1 = True

---

## tool_gearup_armor_sets

*Source: schema/tools/tool_gearup_armor_sets/index.html*

# tool_gearup_armor_sets¶

## Relationships¶

```
erDiagram
 tool_gearup_armor_sets {
 int item_id
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 tool_gearup_armor_sets ||--o{ items : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| item_id 
| items 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| class 
| tinyint 
| Class 

| level 
| smallint 
| Level 

| slot 
| tinyint 
| Slot Identifier 

| item_id 
| int 
| Item Identifier 

| score 
| mediumint 
| Score 

| expansion 
| tinyint 
| Expansion

---

## trader

*Source: schema/trader/trader/index.html*

# trader¶

## Relationships¶

```
erDiagram
 trader {
 intunsigned char_id
 intunsigned item_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 trader ||--o{ character_data : "One-to-One"
 trader ||--o{ items : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| char_id 
| character_data 
| id 

| One-to-One 
| item_id 
| items 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| char_id 
| int 
| Unique Character Identifier 

| item_id 
| int 
| Item Identifier 

| serialnumber 
| int 
| Serial Number 

| charges 
| int 
| Charges 

| item_cost 
| int 
| Item Cost 

| slot_id 
| tinyint 
| Slot Identifier

---

## trader_audit

*Source: schema/trader/trader_audit/index.html*

# trader_audit¶

## Relationships¶

```
erDiagram
 trader_audit {
 varchar buyer
 varchar seller
 varchar itemname
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 trader_audit ||--o{ character_data : "One-to-One"
 trader_audit ||--o{ items : "One-to-One"
 trader_audit ||--o{ character_data : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| buyer 
| character_data 
| name 

| One-to-One 
| itemname 
| items 
| name 

| One-to-One 
| seller 
| character_data 
| name 

## Schema¶

| 

Column 
| Data Type 
| Description 

| time 
| datetime 
| Time 

| seller 
| varchar 
| Seller 

| buyer 
| varchar 
| Buyer 

| itemname 
| varchar 
| Item Name 

| quantity 
| int 
| Quantity 

| totalcost 
| int 
| Total Cost 

| trantype 
| tinyint 
| Transaction Type

---

## fishing

*Source: schema/tradeskills/fishing/index.html*

# fishing¶

## Relationships¶

```
erDiagram
 fishing {
 varchar content_flags
 varchar content_flags_disabled
 int Itemid
 int zoneid
 int npc_id
 }
 content_flags {
 varchar flag_name
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 npc_types {
 intunsigned alt_currency_id
 int id
 int npc_faction_id
 text name
 intunsigned loottable_id
 intunsigned merchant_id
 intunsigned emoteid
 intunsigned adventure_template_id
 intunsigned armortint_id
 intunsigned npc_spells_id
 intunsigned npc_spells_effects_id
 intunsigned trap_template
 }
 fishing ||--o{ content_flags : "One-to-One"
 fishing ||--o{ content_flags : "One-to-One"
 fishing ||--o{ items : "One-to-One"
 fishing ||--o{ zone : "One-to-One"
 fishing ||--o{ npc_types : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| content_flags 
| content_flags 
| flag_name 

| One-to-One 
| content_flags_disabled 
| content_flags 
| flag_name 

| One-to-One 
| Itemid 
| items 
| id 

| One-to-One 
| zoneid 
| zone 
| zoneidnumber 

| One-to-One 
| npc_id 
| npc_types 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Fishing Identifier 

| zoneid 
| int 
| Zone Identifier 

| Itemid 
| int 
| Item Identifier 

| skill_level 
| smallint 
| Skill Level 

| chance 
| smallint 
| Chance: 0 = Never, 100 = Always 

| npc_id 
| int 
| NPC Type Identifier 

| npc_chance 
| int 
| NPC Chance: 0 = Never, 100 = Always 

| min_expansion 
| tinyint 
| Minimum Expansion 

| max_expansion 
| tinyint 
| Maximum Expansion 

| content_flags 
| varchar 
| Content Flags Required to be Enabled 

| content_flags_disabled 
| varchar 
| Content Flags Required to be Disabled

---

## forage

*Source: schema/tradeskills/forage/index.html*

# forage¶

## Relationships¶

```
erDiagram
 forage {
 varchar content_flags
 varchar content_flags_disabled
 int Itemid
 int zoneid
 }
 content_flags {
 varchar flag_name
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 forage ||--o{ content_flags : "One-to-One"
 forage ||--o{ content_flags : "One-to-One"
 forage ||--o{ items : "One-to-One"
 forage ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| content_flags 
| content_flags 
| flag_name 

| One-to-One 
| content_flags_disabled 
| content_flags 
| flag_name 

| One-to-One 
| Itemid 
| items 
| id 

| One-to-One 
| zoneid 
| zone 
| zoneidnumber 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Forage Identifier 

| zoneid 
| int 
| Zone Identifier 

| Itemid 
| int 
| Item Identifier 

| level 
| smallint 
| Level 

| chance 
| smallint 
| Chance: 0 = Never, 100 = Always 

| min_expansion 
| tinyint 
| Minimum Expansion 

| max_expansion 
| tinyint 
| Maximum Expansion 

| content_flags 
| varchar 
| Content Flags Required to be Enabled 

| content_flags_disabled 
| varchar 
| Content Flags Required to be Disabled

---

## tradeskill_recipe

*Source: schema/tradeskills/tradeskill_recipe/index.html*

# tradeskill_recipe¶

## Relationships¶

```
erDiagram
 tradeskill_recipe {
 int id
 varchar content_flags
 varchar content_flags_disabled
 }
 content_flags {
 varchar flag_name
 }
 tradeskill_recipe_entries {
 int item_id
 int recipe_id
 }
 tradeskill_recipe ||--o{ content_flags : "One-to-One"
 tradeskill_recipe ||--o{ content_flags : "One-to-One"
 tradeskill_recipe ||--o{ tradeskill_recipe_entries : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| content_flags 
| content_flags 
| flag_name 

| One-to-One 
| content_flags_disabled 
| content_flags 
| flag_name 

| Has-Many 
| id 
| tradeskill_recipe_entries 
| recipe_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Tradeskill Recipe Identifier 

| name 
| varchar 
| Recipe Name 

| tradeskill 
| smallint 
| Tradeskill 

| skillneeded 
| smallint 
| Skill Level Needed 

| trivial 
| smallint 
| Trivial Skill Level 

| nofail 
| tinyint 
| No Fail: 0 = False, 1 = True 

| replace_container 
| tinyint 
| Replace Container: 0 = False, 1 = True 

| notes 
| tinytext 
| Notes 

| must_learn 
| tinyint 
| Must Learn: 0 = False, 1 = True 

| learned_by_item_id 
| int 
| 

| quest 
| tinyint 
| Quest Controlled: 0 = False, 1 = True 

| enabled 
| tinyint 
| Enabled: 0 = False, 1 = True 

| min_expansion 
| tinyint 
| Minimum Expansion 

| max_expansion 
| tinyint 
| Maximum Expansion 

| content_flags 
| varchar 
| Content Flags Required to be Enabled 

| content_flags_disabled 
| varchar 
| Content Flags Required to be Disabled

---

## tradeskill_recipe_entries

*Source: schema/tradeskills/tradeskill_recipe_entries/index.html*

# tradeskill_recipe_entries¶

## Relationships¶

```
erDiagram
 tradeskill_recipe_entries {
 int item_id
 int recipe_id
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 tradeskill_recipe {
 int id
 varchar content_flags
 varchar content_flags_disabled
 }
 tradeskill_recipe_entries ||--o{ items : "One-to-One"
 tradeskill_recipe_entries ||--o{ tradeskill_recipe : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| item_id 
| items 
| id 

| One-to-One 
| recipe_id 
| tradeskill_recipe 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Tradeskill Recipe Entry Identifier 

| recipe_id 
| int 
| Unique Tradeskill Recipe Identifier 

| item_id 
| int 
| Item Identifier 

| successcount 
| tinyint 
| Success Count 

| failcount 
| tinyint 
| Fail Count 

| componentcount 
| tinyint 
| Component Count 

| salvagecount 
| tinyint 
| Salvage Count 

| iscontainer 
| tinyint 
| Is Container: 0 = False, 1 = True

---

## ldon_trap_entries

*Source: schema/traps/ldon_trap_entries/index.html*

# ldon_trap_entries¶

## Relationships¶

```
erDiagram
 ldon_trap_entries {
 intunsigned trap_id
 }
 ldon_trap_templates {
 intunsigned id
 smallintunsigned spell_id
 }
 ldon_trap_entries ||--o{ ldon_trap_templates : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| trap_id 
| ldon_trap_templates 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique LDoN Trap Entry Identifier 

| trap_id 
| int 
| Trap Identifier

---

## ldon_trap_templates

*Source: schema/traps/ldon_trap_templates/index.html*

# ldon_trap_templates¶

## Relationships¶

```
erDiagram
 ldon_trap_templates {
 intunsigned id
 smallintunsigned spell_id
 }
 ldon_trap_entries {
 intunsigned trap_id
 }
 spells_new {
 int id
 int descnum
 int effectdescnum
 int effectdescnum2
 int typedescnum
 varchar teleport_zone
 }
 ldon_trap_templates ||--o{ ldon_trap_entries : "Has-Many"
 ldon_trap_templates ||--o{ spells_new : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| id 
| ldon_trap_entries 
| trap_id 

| One-to-One 
| spell_id 
| spells_new 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique LDoN Trap Template Identifier 

| type 
| tinyint 
| Trap Type 

| spell_id 
| smallint 
| Spell Identifier 

| skill 
| smallint 
| Skill 

| locked 
| tinyint 
| Locked: 0 = False, 1 = True

---

## traps

*Source: schema/traps/traps/index.html*

# traps¶

## Relationships¶

```
erDiagram
 traps {
 varchar content_flags
 varchar content_flags_disabled
 smallintunsigned version
 varchar zone
 }
 content_flags {
 varchar flag_name
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 traps ||--o{ content_flags : "One-to-One"
 traps ||--o{ content_flags : "One-to-One"
 traps ||--o{ zone : "One-to-One"
 traps ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| content_flags 
| content_flags 
| flag_name 

| One-to-One 
| content_flags_disabled 
| content_flags 
| flag_name 

| One-to-One 
| version 
| zone 
| version 

| One-to-One 
| zone 
| zone 
| short_name 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Trap Identifier 

| zone 
| varchar 
| Zone Short Name 

| version 
| smallint 
| Version: -1 For All 

| x 
| int 
| X Coordinate 

| y 
| int 
| Y Coordinate 

| z 
| int 
| Z Coordinate 

| chance 
| tinyint 
| Chance: 0 = None, 100 = Always 

| maxzdiff 
| float 
| Max Z Difference 

| radius 
| float 
| Trap Radius 

| effect 
| int 
| Trap Type 

| effectvalue 
| int 
| Effect Value: (Based on Trap Type) 0 = Spell Identifier, 1 = Radius, 2 = NPC Type Identifier, 3 = NPC Type Identifier, 4 = Minimum Damage 

| effectvalue2 
| int 
| Effect Value 2: (Based on Trap Type) 0 = Unused, 1 = (0 = Everything Will Aggro, 1 = Only KoS Will Agro), 2 = Number of NPCs, 3 = Number of NPCs, 4 = Maximum Damage 

| message 
| varchar 
| Message 

| skill 
| int 
| Skill Required 

| level 
| mediumint 
| Level 

| respawn_time 
| int 
| Respawn Timer in Seconds 

| respawn_var 
| int 
| Random Respawn Timer Variance in Seconds 

| triggered_number 
| tinyint 
| Triggered Member 

| group 
| tinyint 
| Group 

| despawn_when_triggered 
| tinyint 
| Despawn When Triggered: 0 = False, 1 = True 

| undetectable 
| tinyint 
| Undetectable: 0 = False, 1= True 

| min_expansion 
| tinyint 
| Minimum Expansion 

| max_expansion 
| tinyint 
| Maximum Expansion 

| content_flags 
| varchar 
| Content Flags Required to be Enabled 

| content_flags_disabled 
| varchar 
| Content Flags Required to be Disabled

---

## tribute_levels

*Source: schema/tributes/tribute_levels/index.html*

# tribute_levels¶

## Relationships¶

```
erDiagram
 tribute_levels {
 intunsigned item_id
 intunsigned tribute_id
 }
 items {
 int id
 int book
 varchar name
 int recasttype
 int icon
 mediumint bardeffect
 int clickeffect
 int focuseffect
 int proceffect
 int scrolleffect
 int worneffect
 }
 tributes {
 intunsigned id
 }
 tribute_levels ||--o{ items : "One-to-One"
 tribute_levels ||--o{ tributes : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| item_id 
| items 
| id 

| One-to-One 
| tribute_id 
| tributes 
| id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| tribute_id 
| int 
| Unique Tribute Identifier 

| level 
| int 
| Level 

| cost 
| int 
| Cost 

| item_id 
| int 
| Item Identifier

---

## tributes

*Source: schema/tributes/tributes/index.html*

# tributes¶

## Relationships¶

```
erDiagram
 tributes {
 intunsigned id
 }
 tribute_levels {
 intunsigned item_id
 intunsigned tribute_id
 }
 tributes ||--o{ tribute_levels : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| id 
| tribute_levels 
| tribute_id 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Tribute Identifier 

| unknown 
| int 
| Unknown 

| name 
| varchar 
| Name 

| descr 
| mediumtext 
| Description 

| isguild 
| tinyint 
| Is Guild: 0 = false, 1 = True

---

## vw_bot_character_mobs

*Source: schema/views/vw_bot_character_mobs/index.html*

# vw_bot_character_mobs¶

## Schema¶

| 

Column 
| Data Type 
| Description 

| mob_type 
| varchar 
| Mob Type: B = Bot, C = Client 

| id 
| int 
| Unique View Bot Character Mob Identifier 

| name 
| varchar 
| Name 

| class 
| decimal 
| Class 

| level 
| int 
| Level 

| last_login 
| int 
| Last Login Unix Timestamp 

| zone_id 
| decimal 
| Zone Identifier 

| deleted_at 
| datetime 
| Deleted At

---

## vw_groups

*Source: schema/views/vw_groups/index.html*

# vw_groups¶

## Schema¶

| 

Column 
| Data Type 
| Description 

| group_id 
| int 
| Group Identifier 

| mob_type 
| char 
| Mob Type 

| name 
| varchar 
| Name 

| mob_id 
| int 
| Mob Identifier 

| level 
| int 
| Level

---

## vw_guild_members

*Source: schema/views/vw_guild_members/index.html*

# vw_guild_members¶

## Schema¶

| 

Column 
| Data Type 
| Description 

| mob_type 
| varchar 
| Mob Type: B = Bot, C = Client 

| char_id 
| int 
| Character Identifier 

| guild_id 
| mediumint 
| Guild Identifier 

| rank 
| tinyint 
| Ranl 

| tribute_enable 
| tinyint 
| Tribute Enable: 0 = False, 1 = True 

| total_tribute 
| int 
| Total Tribute 

| last_tribute 
| int 
| Last Tribute 

| banker 
| tinyint 
| Banker: 0 = False, 1 = True 

| public_note 
| mediumtext 
| Public Note 

| alt 
| tinyint 
| Alt: 0 = False, 1 = True

---

## launcher

*Source: schema/zone/launcher/index.html*

# launcher¶

## Relationships¶

```
erDiagram
 launcher {
 varchar name
 }
 launcher_zones {
 varchar launcher
 varchar zone
 }
 launcher ||--o{ launcher_zones : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| Has-Many 
| name 
| launcher_zones 
| launcher 

## Schema¶

| 

Column 
| Data Type 
| Description 

| name 
| varchar 
| Name 

| dynamics 
| tinyint 
| Dynamics

---

## launcher_zones

*Source: schema/zone/launcher_zones/index.html*

# launcher_zones¶

## Relationships¶

```
erDiagram
 launcher_zones {
 varchar launcher
 varchar zone
 }
 launcher {
 varchar name
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 launcher_zones ||--o{ launcher : "One-to-One"
 launcher_zones ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| launcher 
| launcher 
| name 

| One-to-One 
| zone 
| zone 
| short_name 

## Schema¶

| 

Column 
| Data Type 
| Description 

| launcher 
| varchar 
| Launcher 

| zone 
| varchar 
| Zone Short Name 

| port 
| mediumint 
| Port

---

## zone

*Source: schema/zone/zone/index.html*

# zone¶

## Relationships¶

```
erDiagram
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 content_flags {
 varchar flag_name
 }
 adventure_template {
 intunsigned id
 intunsigned graveyard_zone_id
 varchar zone
 smallintunsigned zone_in_zone_id
 tinyintunsigned zone_version
 varchar version
 }
 doors {
 varchar content_flags
 varchar content_flags_disabled
 int dz_switch_id
 int keyitem
 varchar zone
 varchar dest_zone
 intunsigned dest_instance
 smallint version
 }
 global_loot {
 varchar content_flags
 varchar content_flags_disabled
 int loottable_id
 mediumtext zone
 }
 hackers {
 varchar account
 varchar name
 varchar zone
 }
 zone ||--o{ content_flags : "One-to-One"
 zone ||--o{ content_flags : "One-to-One"
 zone ||--o{ adventure_template : "Has-Many"
 zone ||--o{ doors : "Has-Many"
 zone ||--o{ doors : "Has-Many"
 zone ||--o{ global_loot : "Has-Many"
 zone ||--o{ hackers : "Has-Many"
 zone ||--o{ adventure_template : "Has-Many"
 zone ||--o{ adventure_template : "Has-Many"
 zone ||--o{ adventure_template : "Has-Many"
 zone ||--o{ doors : "Has-Many"

```

```
erDiagram
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 launcher_zones {
 varchar launcher
 varchar zone
 }
 spawn_conditions {
 mediumintunsigned id
 varchar zone
 }
 spawn_condition_values {
 intunsigned instance_id
 intunsigned id
 varchar zone
 }
 spawn_events {
 mediumintunsigned cond_id
 varchar zone
 }
 spawn2 {
 varchar content_flags
 varchar content_flags_disabled
 int pathgrid
 int id
 int spawngroupID
 smallint version
 varchar zone
 }
 zone ||--o{ launcher_zones : "Has-Many"
 zone ||--o{ spawn_conditions : "Has-Many"
 zone ||--o{ spawn_condition_values : "Has-Many"
 zone ||--o{ spawn_events : "Has-Many"
 zone ||--o{ spawn2 : "Has-Many"
 zone ||--o{ spawn2 : "Has-Many"

```

```
erDiagram
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 spells_new {
 int id
 int descnum
 int effectdescnum
 int effectdescnum2
 int typedescnum
 varchar teleport_zone
 }
 traps {
 varchar content_flags
 varchar content_flags_disabled
 smallintunsigned version
 varchar zone
 }
 zone_points {
 varchar content_flags
 varchar content_flags_disabled
 intunsigned target_instance
 varchar zone
 intunsigned target_zone_id
 int version
 }
 bot_data {
 varchar bot_id
 varchar owner_id
 varchar spells_id
 varchar zone_id
 }
 blocked_spells {
 mediumintunsigned spellid
 int zoneid
 }
 zone ||--o{ spells_new : "Has-Many"
 zone ||--o{ traps : "Has-Many"
 zone ||--o{ zone_points : "Has-Many"
 zone ||--o{ bot_data : "Has-Many"
 zone ||--o{ blocked_spells : "Has-Many"
 zone ||--o{ zone_points : "Has-Many"
 zone ||--o{ traps : "Has-Many"
 zone ||--o{ zone_points : "Has-Many"

```

```
erDiagram
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 char_create_combinations {
 intunsigned allocation_id
 intunsigned start_zone
 }
 character_bind {
 intunsigned id
 smallintunsigned zone_id
 mediumintunsigned instance_id
 }
 character_corpses {
 intunsigned id
 intunsigned charid
 varchar charname
 smallintunsigned instance_id
 smallint zone_id
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 character_exp_modifiers {
 int character_id
 int zone_id
 }
 zone ||--o{ char_create_combinations : "Has-Many"
 zone ||--o{ character_bind : "Has-Many"
 zone ||--o{ character_corpses : "Has-Many"
 zone ||--o{ character_data : "Has-Many"
 zone ||--o{ character_exp_modifiers : "Has-Many"

```

```
erDiagram
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 character_peqzone_flags {
 int id
 int zone_id
 }
 fishing {
 varchar content_flags
 varchar content_flags_disabled
 int Itemid
 int zoneid
 int npc_id
 }
 forage {
 varchar content_flags
 varchar content_flags_disabled
 int Itemid
 int zoneid
 }
 graveyard {
 int zone_id
 }
 grid {
 int id
 int zoneid
 }
 zone ||--o{ character_peqzone_flags : "Has-Many"
 zone ||--o{ fishing : "Has-Many"
 zone ||--o{ forage : "Has-Many"
 zone ||--o{ graveyard : "Has-Many"
 zone ||--o{ grid : "Has-Many"

```

```
erDiagram
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 grid_entries {
 int gridid
 varchar grid_id
 int zoneid
 }
 ground_spawns {
 varchar content_flags
 varchar content_flags_disabled
 intunsigned item
 smallint version
 intunsigned zoneid
 }
 instance_list {
 int id
 tinyintunsigned version
 intunsigned zone
 }
 object {
 varchar content_flags
 varchar content_flags_disabled
 int itemid
 int id
 smallint version
 intunsigned zoneid
 }
 object_contents {
 intunsigned itemid
 intunsigned parentid
 mediumintunsigned augslot1
 mediumintunsigned augslot2
 mediumintunsigned augslot3
 mediumintunsigned augslot4
 mediumintunsigned augslot5
 mediumint augslot6
 intunsigned zoneid
 }
 zone ||--o{ grid_entries : "Has-Many"
 zone ||--o{ ground_spawns : "Has-Many"
 zone ||--o{ instance_list : "Has-Many"
 zone ||--o{ object : "Has-Many"
 zone ||--o{ object_contents : "Has-Many"
 zone ||--o{ ground_spawns : "Has-Many"
 zone ||--o{ instance_list : "Has-Many"
 zone ||--o{ object : "Has-Many"

```

```
erDiagram
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 petitions {
 varchar accountname
 varchar charname
 varchar lastgm
 varchar zone
 }
 proximities {
 varchar zoneid
 }
 qs_merchant_transaction_record {
 int char_id
 int merchant_id
 int zone_id
 }
 qs_player_npc_kill_record {
 int npc_id
 int zone_id
 }
 quest_globals {
 int charid
 varchar name
 int npcid
 int zoneid
 }
 zone ||--o{ petitions : "Has-Many"
 zone ||--o{ proximities : "Has-Many"
 zone ||--o{ qs_merchant_transaction_record : "Has-Many"
 zone ||--o{ qs_player_npc_kill_record : "Has-Many"
 zone ||--o{ quest_globals : "Has-Many"

```

```
erDiagram
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 start_zones {
 varchar content_flags
 varchar content_flags_disabled
 int start_zone
 int zone_id
 }
 starting_items {
 varchar content_flags
 varchar content_flags_disabled
 varchar itemid
 varchar zone_id
 varchar zoneid
 }
 task_activities {
 intunsigned activityid
 varchar goalid
 varchar delivertonpc
 intunsigned taskid
 varchar zones
 }
 zone_flags {
 int charID
 int zoneID
 varchar zoneid
 }
 zone ||--o{ start_zones : "Has-Many"
 zone ||--o{ start_zones : "Has-Many"
 zone ||--o{ starting_items : "Has-Many"
 zone ||--o{ task_activities : "Has-Many"
 zone ||--o{ zone_flags : "Has-Many"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| content_flags 
| content_flags 
| flag_name 

| One-to-One 
| content_flags_disabled 
| content_flags 
| flag_name 

| Has-Many 
| short_name 
| adventure_template 
| zone 

| Has-Many 
| short_name 
| doors 
| zone 

| Has-Many 
| short_name 
| doors 
| dest_zone 

| Has-Many 
| short_name 
| global_loot 
| zone 

| Has-Many 
| short_name 
| hackers 
| zone 

| Has-Many 
| short_name 
| launcher_zones 
| zone 

| Has-Many 
| short_name 
| spawn_conditions 
| zone 

| Has-Many 
| short_name 
| spawn_condition_values 
| zone 

| Has-Many 
| short_name 
| spawn_events 
| zone 

| Has-Many 
| short_name 
| spawn2 
| zone 

| Has-Many 
| short_name 
| spells_new 
| teleport_zone 

| Has-Many 
| short_name 
| traps 
| zone 

| Has-Many 
| short_name 
| zone_points 
| zone 

| Has-Many 
| zoneidnumber 
| adventure_template 
| graveyard_zone_id 

| Has-Many 
| zoneidnumber 
| adventure_template 
| zone_in_zone_id 

| Has-Many 
| zoneidnumber 
| bot_data 
| zone_id 

| Has-Many 
| zoneidnumber 
| blocked_spells 
| zoneid 

| Has-Many 
| zoneidnumber 
| char_create_combinations 
| start_zone 

| Has-Many 
| zoneidnumber 
| character_bind 
| zone_id 

| Has-Many 
| zoneidnumber 
| character_corpses 
| zone_id 

| Has-Many 
| zoneidnumber 
| character_data 
| zone_id 

| Has-Many 
| zoneidnumber 
| character_exp_modifiers 
| zone_id 

| Has-Many 
| zoneidnumber 
| character_peqzone_flags 
| zone_id 

| Has-Many 
| zoneidnumber 
| fishing 
| zoneid 

| Has-Many 
| zoneidnumber 
| forage 
| zoneid 

| Has-Many 
| zoneidnumber 
| graveyard 
| zone_id 

| Has-Many 
| zoneidnumber 
| grid 
| zoneid 

| Has-Many 
| zoneidnumber 
| grid_entries 
| zoneid 

| Has-Many 
| zoneidnumber 
| ground_spawns 
| zoneid 

| Has-Many 
| zoneidnumber 
| instance_list 
| zone 

| Has-Many 
| zoneidnumber 
| object 
| zoneid 

| Has-Many 
| zoneidnumber 
| object_contents 
| zoneid 

| Has-Many 
| zoneidnumber 
| petitions 
| zone 

| Has-Many 
| zoneidnumber 
| proximities 
| zoneid 

| Has-Many 
| zoneidnumber 
| qs_merchant_transaction_record 
| zone_id 

| Has-Many 
| zoneidnumber 
| qs_player_npc_kill_record 
| zone_id 

| Has-Many 
| zoneidnumber 
| quest_globals 
| zoneid 

| Has-Many 
| zoneidnumber 
| start_zones 
| zone_id 

| Has-Many 
| zoneidnumber 
| start_zones 
| start_zone 

| Has-Many 
| zoneidnumber 
| starting_items 
| zoneid 

| Has-Many 
| zoneidnumber 
| task_activities 
| zones 

| Has-Many 
| zoneidnumber 
| zone_flags 
| zoneID 

| Has-Many 
| zoneidnumber 
| zone_points 
| target_zone_id 

| Has-Many 
| version 
| adventure_template 
| version 

| Has-Many 
| version 
| doors 
| version 

| Has-Many 
| version 
| ground_spawns 
| version 

| Has-Many 
| version 
| instance_list 
| version 

| Has-Many 
| version 
| object 
| version 

| Has-Many 
| version 
| spawn2 
| version 

| Has-Many 
| version 
| traps 
| version 

| Has-Many 
| version 
| zone_points 
| version 

## Schema¶

| 

Column 
| Data Type 
| Description 

| short_name 
| varchar 
| Short Name 

| id 
| int 
| Unique Entry Identifier 

| file_name 
| varchar 
| File Name 

| long_name 
| text 
| Long Name 

| map_file_name 
| varchar 
| Map File Name 

| safe_x 
| float 
| Safe X Coordinate 

| safe_y 
| float 
| Safe Y Coordinate 

| safe_z 
| float 
| Safe Z Coordinate 

| safe_heading 
| float 
| Safe Heading Coordinate 

| graveyard_id 
| float 
| Graveyard Identifier 

| min_level 
| tinyint 
| Minimum Level 

| max_level 
| tinyint 
| Maximum Level 

| min_status 
| tinyint 
| Minimum Status 

| zoneidnumber 
| int 
| Unique Zone Identifier 

| version 
| tinyint 
| Version 

| timezone 
| int 
| Timezone 

| maxclients 
| int 
| Maximum Clients 

| ruleset 
| int 
| Ruleset Identifier 

| note 
| varchar 
| Note 

| underworld 
| float 
| Bottom Z to represent when the player is under the world 

| minclip 
| float 
| Minimum Clipping Distance 

| maxclip 
| float 
| Maximum Clipping Distance 

| fog_minclip 
| float 
| Fog Minimum Clipping Distance 

| fog_maxclip 
| float 
| Fog Maximum Clipping Distance 

| fog_blue 
| tinyint 
| Fog Blue Level: 0 = None, 255 = Max 

| fog_red 
| tinyint 
| Fog Red Level: 0 = None, 255 = Max 

| fog_green 
| tinyint 
| Fog Green Level: 0 = None, 255 = Max 

| sky 
| tinyint 
| Sky type the client will present as the backdrop 

| ztype 
| tinyint 
| This field is sent directly to the client on zone-in, most zones are set to 0, 1 or 255. 

| zone_exp_multiplier 
| decimal 
| This will multiply the XP to this percentage value (decimal based, 100% = 1.0) 

| walkspeed 
| float 
| Walkspeed in this zone 

| time_type 
| tinyint 
| This value varies depending on the zone but it is sent to the client on zone in. Most starting zones/newbie areas have this value set to 2, dungeons tyically have this set to 0, some zones break from the norm and have values greater than 2, (akanon = 3, blackburrow = 5, cazicthule = 5, crushbone = 5, erudnint = 4, kaladima = 3, etc.) 

| fog_red1 
| tinyint 
| Fog Red Level 1: 0 = None, 255 = Max 

| fog_green1 
| tinyint 
| Fog Green Level 1: 0 = None, 255 = Max 

| fog_blue1 
| tinyint 
| Fog Blue Level 1: 0 = None, 255 = Max 

| fog_minclip1 
| float 
| Fog Minimum Clipping Distance 1 

| fog_maxclip1 
| float 
| Fog Maximum Clipping Distance 1 

| fog_red2 
| tinyint 
| Fog Red Level 2: 0 = None, 255 = Max 

| fog_green2 
| tinyint 
| Fog Green Level 2: 0 = None, 255 = Max 

| fog_blue2 
| tinyint 
| Fog Blue Level 2: 0 = None, 255 = Max 

| fog_minclip2 
| float 
| Fog Minimum Clipping Distance 2 

| fog_maxclip2 
| float 
| Fog Maximum Clipping Distance 2 

| fog_red3 
| tinyint 
| Fog Red Level 3: 0 = None, 255 = Max 

| fog_green3 
| tinyint 
| Fog Green Level 3: 0 = None, 255 = Max 

| fog_blue3 
| tinyint 
| Fog Blue Level 3: 0 = None, 255 = Max 

| fog_minclip3 
| float 
| Fog Minimum Clipping Distance 3 

| fog_maxclip3 
| float 
| Fog Maximum Clipping Distance 4 

| fog_red4 
| tinyint 
| Fog Red Level 4: 0 = None, 255 = Max 

| fog_green4 
| tinyint 
| Fog Green Level 4: 0 = None, 255 = Max 

| fog_blue4 
| tinyint 
| Fog Blue Level 4: 0 = None, 255 = Max 

| fog_minclip4 
| float 
| Fog Minimum Clipping Distance 4 

| fog_maxclip4 
| float 
| Fog Maximum Clipping Distance 4 

| fog_density 
| float 
| This is the intensity of the fog, this should be a number between 0-1, most commonly used is .1 or .33 

| flag_needed 
| varchar 
| Flag Required 

| bucket_name 
| varchar 
| 

| bucket_value 
| varchar 
| 

| bucket_comparison 
| tinyint 
| 

| castoutdoor 
| tinyint 
| Cast Outdoors: 0 = False, 1 = True 

| hotzone 
| tinyint 
| Hotzone: 0 = False, 1 = True 

| insttype 
| tinyint 
| Instance Type 

| shutdowndelay 
| bigint 
| Shutdown Delay 

| peqzone 
| tinyint 
| #peqzone: 0 = False, 1 = True 

| expansion 
| tinyint 
| Expansion 

| bypass_expansion_check 
| tinyint 
| Bypass Expansion Check: 0 = False, 1 = True 

| suspendbuffs 
| tinyint 
| Suspend Buffs: 0 = False, 1 = True 

| rain_chance1 
| int 
| Rain Chance 1 

| rain_chance2 
| int 
| Rain Chance 2 

| rain_chance3 
| int 
| Rain Chance 3 

| rain_chance4 
| int 
| Rain Chance 4 

| rain_duration1 
| int 
| Rain Duration 1 

| rain_duration2 
| int 
| Rain Duration 2 

| rain_duration3 
| int 
| Rain Duration 3 

| rain_duration4 
| int 
| Rain Duration 4 

| snow_chance1 
| int 
| Snow Chance 1 

| snow_chance2 
| int 
| Snow Chance 2 

| snow_chance3 
| int 
| Snow Chance 3 

| snow_chance4 
| int 
| Snow Chance 4 

| snow_duration1 
| int 
| Snow Duration 1 

| snow_duration2 
| int 
| Snow Duration 2 

| snow_duration3 
| int 
| Snow Duration 3 

| snow_duration4 
| int 
| Snow Duration 4 

| gravity 
| float 
| Gravity 

| type 
| int 
| Type (0 = Unknown, 1 = Regular, 2 = Instanced, 3 = Hybrid, 4 = Raid, 5 = City) 

| skylock 
| tinyint 
| Sky Lock 

| fast_regen_hp 
| int 
| Fast Regen Health 

| fast_regen_mana 
| int 
| Fast Regen Mana 

| fast_regen_endurance 
| int 
| Fast Regen Endurance 

| npc_max_aggro_dist 
| int 
| NPC Max Aggro Distance 

| max_movement_update_range 
| int 
| Max Movement Update Range 

| min_expansion 
| tinyint 
| Minimum Expansion 

| max_expansion 
| tinyint 
| Maximum Expansion 

| content_flags 
| varchar 
| Content Flags Required to be Enabled 

| content_flags_disabled 
| varchar 
| Content Flags Required to be Disabled 

| underworld_teleport_index 
| int 
| Underworld Teleport Index 

| lava_damage 
| int 
| Lava Damage Modifier 

| min_lava_damage 
| int 
| Minimum Lava Damage Modifier 

| idle_when_empty 
| tinyint 
| 

| seconds_before_idle 
| int 
|

---

## zone_flags

*Source: schema/zone/zone_flags/index.html*

# zone_flags¶

## Relationships¶

```
erDiagram
 zone_flags {
 int charID
 int zoneID
 varchar zoneid
 }
 character_data {
 intunsigned id
 varchar name
 varchar nane
 intunsigned zone_instance
 intunsigned zone_id
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 zone_flags ||--o{ character_data : "One-to-One"
 zone_flags ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| charID 
| character_data 
| id 

| One-to-One 
| zoneid 
| zone 
| zoneidnumber 

## Schema¶

| 

Column 
| Data Type 
| Description 

| charID 
| int 
| Unique Character Identifier 

| zoneID 
| int 
| Zone Identifier

---

## zone_points

*Source: schema/zone/zone_points/index.html*

# zone_points¶

## Relationships¶

```
erDiagram
 zone_points {
 varchar content_flags
 varchar content_flags_disabled
 intunsigned target_instance
 varchar zone
 intunsigned target_zone_id
 int version
 }
 content_flags {
 varchar flag_name
 }
 instance_list {
 int id
 tinyintunsigned version
 intunsigned zone
 }
 zone {
 int zoneidnumber
 varchar short_name
 tinyintunsigned version
 varchar content_flags
 varchar content_flags_disabled
 }
 zone_points ||--o{ content_flags : "One-to-One"
 zone_points ||--o{ content_flags : "One-to-One"
 zone_points ||--o{ instance_list : "One-to-One"
 zone_points ||--o{ zone : "One-to-One"
 zone_points ||--o{ zone : "One-to-One"
 zone_points ||--o{ zone : "One-to-One"

```

| 

Relationship Type 
| Local Key 
| Relates to Table 
| Foreign Key 

| One-to-One 
| content_flags 
| content_flags 
| flag_name 

| One-to-One 
| content_flags_disabled 
| content_flags 
| flag_name 

| One-to-One 
| target_instance 
| instance_list 
| id 

| One-to-One 
| target_zone_id 
| zone 
| zoneidnumber 

| One-to-One 
| version 
| zone 
| version 

| One-to-One 
| zone 
| zone 
| short_name 

## Schema¶

| 

Column 
| Data Type 
| Description 

| id 
| int 
| Unique Zone Point Identifier 

| zone 
| varchar 
| Zone Short Name 

| version 
| int 
| Version 

| number 
| smallint 
| Represents the iterator field sent in the struct ZonePoint_Entry, zone points for the current zone are sent when client zones in (during Client::Handle_Connect_OP_ReqClientSpawn in client_packet.cpp). This number field must be unique and also could have a hardcoded equivalent in the client, eg. client is expecting a specific number value for a zone point or teleport/object pad, such as in Erudin (erudnext). 

| y 
| float 
| Y Coordinate 

| x 
| float 
| X Coordinate 

| z 
| float 
| Z Coordinate 

| heading 
| float 
| Heading Coordinate 

| target_y 
| float 
| Target Y Coordinate 

| target_x 
| float 
| Target X Coordinate 

| target_z 
| float 
| Target Z Coordinate 

| target_heading 
| float 
| Target Heading Coordinate 

| zoneinst 
| smallint 
| Instance Identifier 

| target_zone_id 
| int 
| Target Zone Identifier 

| target_instance 
| int 
| Target Instance Identifier 

| buffer 
| float 
| Zone Point Buffer 

| client_version_mask 
| int 
| Client Version Mask 

| min_expansion 
| tinyint 
| Minimum Expansion 

| max_expansion 
| tinyint 
| Maximum Expansion 

| content_flags 
| varchar 
| Content Flags Required to be Enabled 

| content_flags_disabled 
| varchar 
| Content Flags Required to be Disabled 

| is_virtual 
| tinyint 
| Is Virtual: 0 = False, 1 = True 

| height 
| int 
| Height 

| width 
| int 
| Width

---

