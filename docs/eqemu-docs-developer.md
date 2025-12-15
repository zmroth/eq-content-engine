# EQEmu Documentation: Developer

> Extracted from docs.eqemu.dev - 10 pages

---

## Build Pipeline

*Source: developer/build-pipeline/index.html*

# Build Pipeline¶

## Platform¶

http://drone.akkadius.com/EQEmu/Server

The current CI pipeline uses Drone which is written in Golang and open source

## Configuration¶

Build configuration is stored `.drone.yml` at the top level of the codebase. Drone configuration reference docs can be found here if a future developer finds themselves navigating it. Is is unlikely and very infrequent that someone should need to

Build scripts are located in `./utils/scripts/build/`

## Hardware¶

The build pipeline runs on dedicated hardware to keep feedback loops tight for developers

| 

**Build Type** 
| **CPU** 
| **RAM** 
| **Disk** 

| Windows 
| Ryzen 9 5900HX (8C/16T, Max 4.6Ghz) 
| 64GB DDR4 
| WD_BLACK 1TB 7,300 MB/s 

| Linux 
| Ryzen 9 5900HX (8C/16T, Max 4.6Ghz) 
| 64GB DDR4 
| WD_BLACK 1TB 7,300 MB/s 

## Time¶

Build times take roughly 3-5 minutes on average. Both Linux and Windows running in parallel in their own steps

---

## Database Conventions

*Source: developer/conventions-guidelines/index.html*

# Introduction¶

Info

Intended audience for this document is EQEmulator Server developers and aspiring developers

## Database Conventions and Guidelines¶

This page serves as a reference for rules that we adhere to as a project, things could change over time but this is mostly a living representation of our current spec.

This does not mean that past table creations match this specification, but that we intend to keep it consistent going forward.

## Contributing¶

For anyone interested in contributing to the database documentation.

If a database table's page has an inaccuracy in a column, modify the database-schema-reference.yml.

This is where all the table and column information is stored.

Please do not submit pull requests modifying the .md files directly, as they will be over-written by the doc-gen.js.

## Table Names¶

- lowercase

- snake_case

- Plural

Table names should be **lowercase**, `snake_case` and should clearly describe the purpose of the table itself.

Table names should also adhere to an appropriate category prefix if necessary. For example, if the table is storing data that is particular to that of a character, it is appropriate to prefix the table name with `character_x`

**Examples**

```
`character_auras
character_bandolier
character_buffs
character_disciplines
`
```

When defining an object or model in the code, our source is inconsistent everywhere, but trend to use the singular name of an entity as an object and the table name as plural.

For example I have a class representing a `Door` and a table named `doors`

## Column Naming¶

Like **Table Names** columns also adhere to **lowercase** and `snake_case` appropriations. The column itself should very easily describe the purpose of the column itself without abbreviations as much as possible.

For example, instead of `p_cp`, it is far easier for new server operators and developers to understand `player_copper`, don't be lazy and don't be afraid to be verbose.

### Foreign Key Consistency¶

If your column has a relationship to another table, make sure that it prefixes the table name with id.

**Example**

I'm making a new table called `keyring` and the schema looks like this:

```
`id - int(11) pri - key
character_id - int(11)
item_id - int(11)
`
```

We easily know that we have a loose foreign key relationship to the `character_data` table (Which currently breaks convention and should be called `characters`).

We also know that we have a loose relationship to the `items` table and we resolve to `items:id`

## Have an Integer Primary Key¶

At minimum, add the standard `id` column with an auto-incrementing integer. This makes sequencing easier.

## Store Datetimes as Datetimes¶

We can easily convert to and from unix using datetime, use this as a standard practice.

## Indexes¶

A simple index can go a long way for performance if you have data that is being looked up frequently especially in the case of strings.

For example, we have a table called `saylink` (should be plural) that contains `phrase` which gets looked up frequently when a saylink is clicked or when saylinks are being parsed inside of a `quest::say` context, this lookup and scan gets expensive when there is no index on the column itself. 

What ends up happening is that the MySQL engine ends up having to do full table scans to find the phrase corresponding to the requested record to see if it exists or lookup and ID associated to said saylink.

If your table's primary method of lookup is through `id` - you already get indexing out of the box, there is no additional indexes required.

## Unsigned Versus Signed¶

Only use what you intend to use for your integer space, if you don't plan on having negative values, make your field unsigned and corresponding C/C++ datatype to match. Or, use a bigger data integer type as signed to store your unsigned value.

## Soft Deletes¶

If your table or feature uses the concept of soft deleting an object, please use `deleted_at` in a `datetime` field to mark that entity as deleted and then make sure you use queries that take into consideration where `deleted_at` is null (An index may be appropriate on this field).

---

## Database Migrations

*Source: developer/database-schema-migrations/index.html*

# Database Schema Migrations¶

## Changes in the Source¶

You need to increment a define in the source that dictates what database version the source SHOULD be running at

**Location** `common/version.h`

The database version will need to match the manifest entry you have added, more on that in a moment

`CURRENT_BINARY_DATABASE_VERSION = 9240`

## The Manifest¶

The manifest is located at **common/database/database_update_manifest.cpp**

Add a struct representing your migration 

```
` ManifestEntry{
 .version = 9240,
 .description = "2023_10_29_variables_id.sql",
 .check = "SHOW COLUMNS FROM `variables` LIKE 'id'",
 .condition = "empty",
 .match = "",
 .sql = R"(
ALTER TABLE `variables`
ADD COLUMN `id` int(11) NOT NULL AUTO_INCREMENT FIRST,
DROP PRIMARY KEY,
ADD PRIMARY KEY (`id`) USING BTREE,
ADD UNIQUE INDEX(`varname`);
)"
 },
`
```

That's it! As far as what is needed from a developer to have the server run the migration, that is all you need to do.

You can test it by running world manually after you compile. Please test your database migrations before submitting a PR, it's a very simple mistake to avoid trying to fix later.

## Manifest Conditions¶

```
`// see struct definitions for what each field does
// struct ManifestEntry {
// int version{}; // database version of the migration
// std::string description{}; // description of the migration ex: "add_new_table" or "add_index_to_table"
// std::string check{}; // query that checks against the condition
// std::string condition{}; // condition or "match_type" - Possible values [contains|match|missing|empty|not_empty]
// std::string match{}; // match field that is not always used, but works in conjunction with "condition" values [missing|match|contains]
// std::string sql{}; // the SQL DDL that gets ran when the condition is true
// };
`
```

---

## EQDictionary

*Source: developer/eqdictionary/index.html*

# EQDictionary¶

#### What is it?¶

EQDictionary is a collection of lookup references, accessed by specific namespaces and referenced by implementation standard, or client and mob versions.

References are usually tied back to the originating client definition and are available through an indexed lookup system. Server-based 'hybrid' definitions may also be implemented to bridge differences between client implementations and server requirements.

The purpose of this system is to allow cyclic or minimum conditional evaluations in order to transform data..

#### What can you do with it?¶

Simplifying coding methodology can change current standards from this:

```
`if (ClientVersion() >= EQEmu::versions::ClientVersion::SoF) { bank_slot_count = 24; }

else { bank_slot_count = 16; }

if (current_slot >= bank_slot_count) { return; }
`
```

Or this:

```
`if (m_ClientBitmask & EQEmu::versions::maskSoFAndLater) { bank_slot_count = 24; }

else { bank_slot_count = 16; }

if (current_slot >= bank_slot_count) { return; }
`
```

To this:

```
`if (current_slot >= m_inv.GetInv().GetLookup()->InventoryTypeSize.Bank) { return; }
`
```

The first case requires that clients to be added in order of release.

The second case will allow clients to be added in any order..but, requires awkward manipulation of mask bits.

The EQDictionary (last) case does not require any special ordering of clients or manipulation of mask bits. In fact, this system makes ClientVersion comparison and bitmask use obsolete.

Additionally, duplicate definitions can be avoided by having a singular location to reference..

#### What makes up EQDictionary?¶

Static and Dynamic references.

Static references are design-/compile-time definitions of maximum client version-based values and are linked in 2 ways:

- Server implementation standard accessed through `EQEmu::<system_namespace>::<property>`

- Server-based version lookup accessed through `EQEmu::<system_namespace>::Lookup(version)-><property>`

*Note: invalid versions return the default, null-set reference*

Dynamic references are run-time definitions based on expansion settings, and possibly other criteria.

There are 2 dynamic references based on gm flag states `<set>` and `<clear>`.

Dynamic lookups are usually embedded into a system class..but, their use is not exclusive to them.

Not every case of client/mob version and gm flag set/clear will receive a dynamic entry. In these cases, the static reference is returned.

The entries are constructed based on expansion settings when the initial call to `EQEmu::<system_namespace>::InitializeDynamicLookups()` is performed at server start-up.

Creating dynamic lookups and embedding them into system classes allow for criteria updates that would normally require even more state condition checks and more static variable definitions making proper support for per-expansion and gm flag states without them impractical.

(The number of static lookups required to support non-dynamic lookups would essentially be 'the number of expansions' -> squared, then multiplied by 2 to account for gm state.)

Dynamic lookups resolve the complexity of coding needed to support the myriad of conditions required support to customizable server features.

A deep, working knowledge of client behavior is required to correctly set up dynamic entries. Testing through server setting changes and client observation is the best way to achieve this..

#### Where do I look for all of this?¶

Currently, the following files comprise the system:

- emu_constants.h

- emu_limits.h

- emu_limits.cpp

- eq_limits.h

- eq_limits.cpp

- titanium_limits.h

- titanium_limits.cpp

- sof_limits.h

- sof_limits.cpp

- sod_limits.h

- sod_limits.cpp

- uf_limits.h

- uf_limits.cpp

- rof_limits.h

- rof_limits.cpp

- rof2_limits.h

- rof2_limits.cpp

#### How do I create a new lookup or add to an existing one?¶

Adding properties to an existing lookup involves most of the same steps as creating a new lookup system.

---

## Logging

*Source: developer/logging/index.html*

# Logging for Developers¶

## Using Logs in Source¶

Using logs are very simple and are macro-driven. We use macros because we check for whether or not the log is enabled or has the level of logging enabled before even attempting to try to create strings and allocate them on the stack and waste precious resources discarding them right away. Preprocessor macros (Aliases below) allow us to do this cleanly and performant and makes for a nice developer experience.

Our logging aliases use CPP fmt library conveniently under the hood - so you don't have to think about what your data type bindings look like.

Example

```
`LogDynamicZones("Caching [{}] dynamic zone(s) took [{}s]", dynamic_zone_cache.size(), bench.elapsed());
`
```

```
`LogDynamicZones("Purging [{}] dynamic zone(s)", dz_ids.size());
`
```

```
`LogLootDetail(
 "NPC [{}] does not meet loot_drop level requirements (min_level) level [{}] current [{}] for item [{}]",
 GetCleanName(),
 loot_drop.npc_min_level,
 GetLevel(),
 database.CreateItemLink(loot_drop.item_id)
);
`
```

```
`LogLoot(
 "[NPC::AddLootDrop] NPC [{}] Item ({}) [{}] charges [{}] chance [{}] trivial min/max [{}/{}] npc min/max [{}/{}]",
 GetName(),
 item2->ID,
 linker.GenerateLink(),
 loot_drop.item_charges,
 loot_drop.chance,
 loot_drop.trivial_min_level,
 loot_drop.trivial_max_level,
 loot_drop.npc_min_level,
 loot_drop.npc_max_level
);
`
```

```
`LogInfo("Client Files Export Utility");
`
```

## Logging Aliases¶

Logging aliases are maintained in **eqemu_logsys_log_aliases.h**

Info

Aliases

All aliases have a "Detail" equivalent (Logging level 3)

```
`LogInfo(message, ...);
LogDebug(message, ...);
LogAA(message, ...);
LogAI(message, ...);
LogAggro(message, ...);
LogAttack(message, ...);
LogPacketClientServer(message, ...);
LogCombat(message, ...);
LogCommands(message, ...);
LogCrash(message, ...);
LogDoors(message, ...);
LogGroup(message, ...);
LogGuilds(message, ...);
LogInventory(message, ...);
LogLauncher(message, ...);
LogNetcode(message, ...);
LogNormal(message, ...);
LogObject(message, ...);
LogPathing(message, ...);
LogQSServer(message, ...);
LogQuests(message, ...);
LogRules(message, ...);
LogSkills(message, ...);
LogSpawns(message, ...);
LogSpells(message, ...);
LogTCPConnection(message, ...);
LogTasks(message, ...);
LogTradeskills(message, ...);
LogTrading(message, ...);
LogTribute(message, ...);
LogMySQLError(message, ...);
LogMySQLQuery(message, ...);
LogMercenaries(message, ...);
LogQuestDebug(message, ...);
LogLoginserver(message, ...);
LogClientLogin(message, ...);
LogHeadlessClient(message, ...);
LogHPUpdate(message, ...);
LogFixZ(message, ...);
LogFood(message, ...);
LogTraps(message, ...);
LogNPCRoamBox(message, ...);
LogNPCScaling(message, ...);
LogMobAppearance(message, ...);
LogStatus(message, ...);
LogAIScanClose(message, ...);
LogAIYellForHelp(message, ...);
LogAICastBeneficialClose(message, ...);
LogAoeCast(message, ...);
LogEntityManagement(message, ...);
LogFlee(message, ...);
LogAura(message, ...);
LogHotReload(message, ...);
LogMerchants(message, ...);
LogZonePoints(message, ...);
LogExpeditions(message, ...);
LogDynamicZones(message, ...);
LogCheatList(message, ...);
LogClientList(message, ...);
LogDiaWind(message, ...);
LogHTTP(message, ...);
`
```

## Adding New Logging Categories¶

For development purposes, you may want to add a new category, this is very simple to do 

An example of a category being added can be seen at this commit: How to add a category. 

Once you've added the code to the mentioned sections, the next time world boots world will inject the logging categories if they don't exist in the table.

## Adding Default Values¶

In **eqemu_logsys.cpp** you can set default values for the log system initialization routine

https://github.com/EQEmu/Server/blob/master/common/eqemu_logsys.cpp

eqemu_logsys.cpp

```
`void EQEmuLogSys::LoadLogSettingsDefaults()
{
 /**
 * Set Defaults
 */
 log_settings[Logs::WorldServer].log_to_console = static_cast<uint8>(Logs::General);
 log_settings[Logs::ZoneServer].log_to_console = static_cast<uint8>(Logs::General);
 log_settings[Logs::QSServer].log_to_console = static_cast<uint8>(Logs::General);
 log_settings[Logs::UCSServer].log_to_console = static_cast<uint8>(Logs::General);
 log_settings[Logs::Crash].log_to_console = static_cast<uint8>(Logs::General);
 log_settings[Logs::MySQLError].log_to_console = static_cast<uint8>(Logs::General);
 log_settings[Logs::Loginserver].log_to_console = static_cast<uint8>(Logs::General);
 log_settings[Logs::HeadlessClient].log_to_console = static_cast<uint8>(Logs::General);
 log_settings[Logs::NPCScaling].log_to_gmsay = static_cast<uint8>(Logs::General);
 log_settings[Logs::HotReload].log_to_gmsay = static_cast<uint8>(Logs::General);
 log_settings[Logs::HotReload].log_to_console = static_cast<uint8>(Logs::General);
 log_settings[Logs::Loot].log_to_gmsay = static_cast<uint8>(Logs::General);
 log_settings[Logs::Scheduler].log_to_console = static_cast<uint8>(Logs::General);
 log_settings[Logs::Cheat].log_to_console = static_cast<uint8>(Logs::General);
 log_settings[Logs::HTTP].log_to_console = static_cast<uint8>(Logs::General);
 log_settings[Logs::HTTP].log_to_gmsay = static_cast<uint8>(Logs::General);
...
`
```

Similarly, when you add defaults here. World will inject these defaults into the database for users who pick up your new logging addition.

## Adding Aliases¶

When you create a new category, we later added support for logging aliases which you must add for ease of use.

eqemu_logsys_log_aliases.h

```
`#define LogSaylink(message, ...) do {\
 if (LogSys.log_settings[Logs::Saylink].is_category_enabled == 1)\
 OutF(LogSys, Logs::General, Logs::Saylink, __FILE__, __func__, __LINE__, message, ##__VA_ARGS__);\
} while (0)

#define LogSaylinkDetail(message, ...) do {\
 if (LogSys.log_settings[Logs::Saylink].is_category_enabled == 1)\
 OutF(LogSys, Logs::Detail, Logs::Saylink, __FILE__, __func__, __LINE__, message, ##__VA_ARGS__);\
} while (0)
`
```

Using said alias then becomes very simple

Example

```
````cpp
LogSaylink("Loaded [{}] saylinks into cache", saylinks.size());
```
`
```

---

## Prepared Statements

*Source: developer/mysql-stmt/index.html*

# MySQL Prepared Statements¶

This document contains implementation notes and information for developers that may intend to use the prepared statement C++ API for MySQL queries.

## Thread Safety¶

Ideally threads would have their own database connections but the current zone connections may be used concurrently in other threads. The `mysql::PreparedStmt` class locks the `DBcore` connection mutex in calls to `Prepare`, `Execute`, and when `~PreparedStmt` destruction closes the stmt in an attempt to make it safe to use with server connections.

The MySQL C API documentation provides no specific guidance for using prepared statements on a connection shared by multiple threads. The only real guarantee for safety is to synchronize the connection for the lifetime of the `mysql::PreparedStmt`.

Warning

Prepared statements should only be used on the main thread even if the connection is synchronized. This is because server logging is performed internally which is not synchronized.

Info

The #hotfix command may be the only real use of querying in another thread.

Regular queries are synchronized by locking the connection mutex for the query until the results are buffered (`mysql_real_query` and `mysql_store_result`). `mysql::PreparedStmt` is designed to prepare, execute (possibly many times), fetch, and close separately. The following are only observed guidelines for making these safe to use on connections shared with other threads and may not be accurate:

- 

Synchronizing with the `DBcore` connection mutex must be done before any use of `Prepare()` or `Execute()`. The lock can be released between these calls.

- 

The connection mutex needs to be locked when `PreparedStmt` closes its statement during destruction (`mysql_stmt_close`).

- 

If the `buffer_results` option is enabled then `Fetch()` should be safe to use without locking the connection since it accesses results stored on the client.

- 

If result buffering is disabled then the connection cannot be used after `Execute` until all rows are fetched or freed from the result set. Failure to do so will cause a `Commands out of sync` error if another query is attempted on the same connection. **This makes it impossible to use prepared statements safely without buffering results when used with multithreaded server connections.**

Note

Unbuffered prepared statements would be possible to use safely if the connection mutex was exposed in the `DBcore` public API but the caller would be responsible for locking it before execute and holding it until all rows were fetched. The connection mutex is recursive so there would be no risk of deadlock from internal `PreparedStmt` functions also locking it. Alternatively `PreparedStmt` could be given an option on construction to hold a lock on the connection mutex for its lifetime.

## Error Handling¶

Prepared statements will throw a `std::runtime_error` exception for errors. This differs from regular server queries which return an empty object and requires checking for success. This means usage must be wrapped in try/catch but simplifies error handling internally.

## Options¶

The `StmtOptions` class contains options that may be changed to increase performance but care must be taken if the database connection is used concurrently.

`buffer_results`

Enabled by default. Disabling may improve performance.

Stores the entire result set on client by calling `mysql_stmt_store_result` after executing a prepared statement.

This transfers the full result set over the network and uses more memory but gives access to total row count and `max_length` of columns.

If disabled memory usage is reduced and each row is fetched over the network. Disabling may also require output buffers for strings to be re-allocated while fetching since `max_length` will be unavailable.

Warning

This option must be enabled if other queries could occur on the same connection before all results are fetched or freed. Failure to do so will cause a `Commands out of sync` error.

`use_max_length`

Enabled by default. Requires `buffer_results` to be enabled. Disabling may improve performance when storing results.

This causes the `max_length` of fields to be calculated when a prepared statement is executed so output buffers for strings may be pre-allocated.

If disabled, output buffers for string columns may need to be re-allocated while fetching.

See note in official `mysql_stmt_store_result` documentation for more information.

## Column Values¶

`mysql::StmtColumn` getters return a `std::optional<T>` to make it easier to handle columns that might return a `NULL` value. If the caller knows the column cannot be null, then it may just dereference the optional to get the value without the overhead of checking. Otherwise it should check if the optional has a value or use `value_or()` to return a fallback default value.

## Example¶

```
`#include <../common/mysql_stmt.h>

void foo()
{
 try
 {
 mysql::PreparedStmt stmt = content_db.Prepare("select * from spells_new where id = ? or Name = ?");
 mysql::StmtResult result = stmt.Execute({ 100, "Illusion: Feir'Dal" });
 int total_rows = result.RowCount();
 while (mysql::StmtRow row = stmt.Fetch())
 {
 int32_t id = *row.Get<int32_t>(0); // get id by col index, we know this can't be NULL so dereference
 std::string name = row["name"].value_or(""); // get str by field name, value may be NULL
 }
 }
 catch (const std::exception& ex)
 {
 // handle failure, the error is already logged with LogMySQLError
 }
}
`
```

## API¶

### DBcore::Prepare¶

---

`Prepare(string query)`

Prepares a statement and returns a `mysql::PreparedStmt` object.

Throws `std::runtime_error` if an error occurs.

### mysql::PreparedStmt¶

---

Types

`param_t`
`std::variant` of supported argument types for MySQL prepared statement execution

```
`using param_t = std::variant<int8_t, uint8_t, int16_t, uint16_t, int32_t, uint32_t, int64_t, uint64_t, float, double, bool, std::string_view, std::nullptr_t>;
`
```

Functions

`Execute()`
`Execute(const std::vector<T>& inputs)`
`Execute(const std::vector<param_t>& inputs)`

Executes the prepared statement with specified input arguments and returns a `mysql::StmtResult` object.

Throws `std::runtime_error` if an error occurs.

`Fetch()`

Fetches the next row and returns a `mysql::StmtRow` object. The returned object will evaluate as `false` when there are no more rows to fetch.

Throws `std::runtime_error` if an error occurs.

### mysql::StmtResult¶

---

Represents the result of executing a prepared statement. Holds a non-owning view of column data and should not be used if the prepared statement is executed again.

`ColumnCount()`
Returns the number of fields in a result set for a `SELECT` query.
`LastInsertID()`
Returns the last insert id of an `AUTO_INCREMENT` column generated by an `INSERT` query.
`RowCount()`
Returns the number of rows in a result set for a `SELECT` query. If buffering is disabled for the prepared statement then this will return 0.
`RowsAffected()`
Returns the number of rows affected by an `UPDATE`, `DELETE`, or `INSERT` query.

### mysql::StmtRow¶

---

Provides a non-owning view of column values in a result set. This object overrides `operator bool()` to evaluate as false if it does not contain a fetched row.

`ColumnCount()`
Returns number of fields in the row.
`GetColumn<T>(size_t index)`
`GetColumn<T>(std::string_view name)`
Returns a `mysql::StmtColumn` pointer to the column. Returns `nullptr` if the column doesn't exist.
`Get<T>(size_t index)`
`Get<T>(std::string_view name)`
Returns a `std::optional<T>` with the column value as a numeric `T`. Returns `std::nullopt` if the column doesn't exist, the value is NULL, or the field type is unsupported. See `StmtColumn::Get<T>()`.
`GetStr(size_t index)`
`GetStr(std::string_view name)`
Returns a `std::optional<std::string>` with the column value as a string. Returns `std::nullopt` if the column doesn't exist, the value is NULL, or the field type is unsupported. See `StmtColumn::GetStr()`.

### mysql::StmtColumn¶

---

Stores a column value buffer.

`Get<T>()`

Returns a `std::optional<T>` with the column value as a numeric `T`. Returns `std::nullopt` if the column value is `NULL` or the field type is unsupported.

Warning

This will truncate number values to the specified `T` type so the caller is responsible for requesting the proper type based on database field type.

Time and Date fields are converted to `time_t` before casting to the desired `T` type.

Bit fields are converted to `uint64_t` before casting to the desired `T` type.

If `T` is `bool` then string field types return `false` for empty strings and `true` otherwise.

If `T` is not `bool` then string field types return `0` (`T` is zero-initialized) if the string cannot be converted to a number.

`GetBuf()`
Returns a `std::span<const uint8_t>` view of the column value buffer. This may be used to get the raw bytes and length of the value without any conversions.
`GetStr()`

Returns a `std::optional<std::string>` with the column value as a string. Returns `std::nullopt` if the column value is `NULL` or the field type is unsupported.

Time and Date fields are formatted as strings specified in the MySQL C API.

Bit fields are formatted as a `uint64_t` converted to a string.

`GetStrView()`
Returns a `std::optional<std::string_view>` view of the column string value. Returns `std::nullopt` if the column value is `NULL` or not a string. This may be used to avoid making a copy of strings if callers do not need to store it.
`Index()`
Returns the index of the column in the result set.
`IsNull()`
Returns bool specifying if the column value is `NULL`.
`IsUnsigned()`
Returns bool specifying if the column field type is unsigned.
`Name()`
Returns the field name.
`Type()`
Returns the `buffer_type` of the field.

---

## Packet and OpCode Analysis

*Source: developer/packet-and-opcode-analysis/index.html*

# Packet and OpCode Analysis¶

Expanding features of currently supported Everquest clients is not a trivial matter, and is a task made more complex without packet captures from the time when that client was in use. It is still possible to identify data structures for older clients by examining captures from the most recent client.

The information that follows is a collection of basic information I’ve learned about capturing packets, interpreting them, finding opcodes, and how to test them in the emulator. The information not included here is that it’s a ton of trial and error, testing theories, basic debugging skill, familiarity with live debugging of processes without debug symbols, etc. Depending on what you want to do, this is not a trivial task.

## Capturing Packets from Live¶

There are a variety of tools available for capturing network traffic. My preference is Microsoft Message Analyzer. Wireshark is another very popular choice. If you don't have any experience with these types of tools, take some time and familiarize yourself with a few of them before picking one.

The capture tool can be installed on the same computer that you will use to play Everquest, or it can be installed on a separate machine that sits between your client and the Everquest servers. Neither poses a risk of being detected by Daybreak as packet logging is a passive operation. The benefit to using a proxy device is that you can modify packets before they reach your client machine. For the purposes of this article, I am only focusing on same box installations.

## Getting a capture¶

Before you launch the capture tool, make sure you've shut down as many running processes on your machine as possible (mail clients, RDP sessions, chat programs, etc.) This will reduce noise by reducing the amount of potential network traffic. You can also filter this out later, but I prefer to start with as small a set of data as possible.

In your capture tool, select to log only UDP protocol traffic. You can further simplify this by filtering the capture to be UDP packets from your machine's IP address to EQ's servers, and packets from EQ's servers to your IP address.

Sample filtering rule for Microsoft Network Analyzer to reduce noise: `UDP and !TCP and !SSDP and !ICMPv6 and !DNS and !LLMNR and !WSDiscovery and !IPv6NoNxt and !IPv6 and *Destination != 10.0.0.255 and *Destination != yourmachineiphere and *Source != 192.168.2.225`

Another approach: `UDP and (*Source in 69.174.0.0/16 or *Destination in 69.174.0.0/16)`

When I’m setting up for a capture, I initially log the entire login sequence from authentication, through character select, and into the server. That captures a large amount of data that is helpful for identifying the specific patch (the last time the client was patched), the server’s entire list of guilds, character select information, etc. This approach does log your account name and password. If you plan on sharing this capture file, make sure you delete those packets, and the packets that list your character names.

To configure Message Anaylzer to properly export for the extractor, first you need to right click the header column of the preview pane, and go to Add Column... Navigate to TCP->Segment->Payload. Right click and select Add as column. Now, right click a row in the Payload section column, select Display Binary Values As -> Hex. Now, To export the capture in Message Analyzer, go to Session -> Analysis Grid -> Export -> All, in the drop down choose Tab Delimited (*.txt)

Then, I will move my character to the area of the game I want to investigate. If, for example, I wanted to learn more about how Shrouds work I would move to a Shroud “vendor”. Then I would start a capture session, interact with the vendor, and save the capture. Screenshots are also helpful, especially for cases where you can see information on the screen. This will help pinpoint specific values (data type and placement) in the packet. I usually repeat that process at least one more time to pinpoint which packets relate to shrouds and which were just noise from other people in the zone.

Sometimes the data for a particular action is sent once and cached in memory, so it can be helpful to zone and/or log off and back on to get more information about how the server and client interact. It is also useful to get a capture from a different server to isolate if values are constant across servers, or if they are server specific. For instance, zone IDs will be constant, but player and guild IDs will vary.

## ShowEQ Source¶

ShowEQ is a valuable second source of information. While they do not map every Opcode in each ShowEQ patch, they do map enough of them to help you pin down some additional information.

Navigate to the ShowEQ repo’s Tags folder. Here you will find a list of all releases, each corresponding to a patch from Verant/Sony/Daybreak.

Look at the Date column to see when each patch was released. Select one of the folders and then select the conf subfolder. The only files we are concerned with are worldopcodes.xml and zoneopcodes.xml. These contain the world and zone opcodes, but not all of them were updated for the latest patch. Only the ones ShowEQ needs were updated. Thankfully, if you look inside each file you can see the date/time each opcode was updated.

## Reading a capture¶

You cannot directly use a packet capture. Most packets will be compressed and most likely transmitted as Combined or Oversized packets. Making sense of them requires understanding the network-level packet structures so that you can decompress them and break them into individual packets. The only good way to do this is via code. I’m sure there is an existing toolset to do this, but I opted for writing one. You can find the source here. It is fairly basic in function, which is perfectly fine for my purposes (so far).

Once the packets have been uncompressed and split apart, the opcodes from ShowEQ come into play. The tool maps packet opcodes to known opcodes and indicates packet direction (to or from the server). It also outputs each packet in byte format, hex format, and as a string. This helps make some calculations easier and the raw string output can enable faster identification of packet structure if it contains string values.

Unfortunately, most Opcodes are not mapped each time a patch comes out, and because Daybreak still changes Opcodes with each patch, most packets are not immediately identifiable. Therefore, it is extremely important to focus your packet captures to the smallest possible sample size.

Sample output of an Emulator server OP_ChannelMessage packet:\

Idx: 16\
Size:56\
From: Server\
OpCode: OP_ChannelMessage::bc,33\
Bytes:0,9,1,248,188,51,78,105,103,101,108,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,100,0,0,0,112,97,99,107,101,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0\
Hex:00,09,01,f8,bc,33,4e,69,67,65,6c,00,00,00,00,00,00,00,00,00,00,08,00,00,00,00,00,00,00,00,64,00,00,00,70,61,63,6b,65,74,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00\
String: ??3Nigel d packet \

In the above case, we know the format because it is a well-known type, and it is from an Emulator server, but if we did not, the next step would be to identify suspected values. When there are visible words, you usually have a preceding string length (e.g. 8,0,0,0 for an 8-character string), or if not, a trailing null terminator (0).

## Opcode identification in the client¶

Finding an opcode in the current client is easy. It’s in the packet capture. Finding the corresponding opcode in an emulator supported client is more complex. If ShowEQ doesn’t have a mapping, and if the emulator doesn’t already have that code identified, the only option remaining is to decompile eqgame.exe and try to find it. I am going to very briefly touch on this because it is a much more complex topic and requires knowledge of assembly language and debugging tools such as windbg, windbgx, IDA Pro, etc. Opcodes appear in the following structure:\

cmp edx,1659h\
ja loc_13FF3ED\
jz loc_13FF512

They may also appear like this:\

cmp [ebp+var_5354], 6786h\
ja short loc_4C1BD8\
cmp [ebp+var_5354], 6786h\
jz short loc_4C90DB

They also appear in multiple sections with login-based opcodes (e.g. guild list, password mismatch, etc.) typically being in an entirely separate part of the executable. The other opcodes are in blocks (like those above) with jumps to other blocks of opcodes (if smaller than X, goto location ABC, else goto location ZYX).

The way I’ve done this, and there may be a better approach, is to first look in the existing client for that opcode. Then I look at the assembly instructions that are executed by that opcode to learn more about what happens when that opcode is received. From there I’ll open the version of the client that is supported by the emulator and attempt to find the same pattern of instructions.

Once you’ve identified a probable list of opcodes in the target client version, and you’ve picked apart the various fields in the packet, you can quickly attempt to simulate it using an emulator server and some quest NPCs.

## Sending packets using LUA quest files¶

The fastest way to identify fields in a packet, or to attempt to test specific opcodes is to use quest files. You can edit a quest NPC to send packets of any type, with whatever opcode you specify, and then cause the NPC to send them to your client.

The risk is that you may crash your client. A lot. However, I’ve found this to be a very effective way to prove some theories without having to modify the emulator source. For a real-world example, I’m trying to pick apart the Purchase Property window for Neighborhoods. I know the opcode and I have samples from Live but sending that packet to the RoF client always results in a crash. That packet has strings that would be allocated in memory, so my theory is that the packet format changed and that changed where the string length values were located. To test this, I zeroed out the packet and sent it.

No crash. Then I started adding values back in and was able to get the window to display. All the values are totally wrong, so I’m not done yet, but that gave me enough information to focus live debugging of the client to pinpoint the exact issue.

Put another way. This is not a trivial task (for me).

Example .LUA code:\

local pack = Packet(0x67C9, 6, true);\
pack:WriteInt8(0,195);\
pack:WriteInt8(1,219);\
pack:WriteInt8(2,248);\
pack:WriteInt8(3,7);\
e.other:QueuePacket(pack);

In the above, I’m sending a packet and I’m creating it by writing individual byte values. You can write different types, but I found that when working against packet captures and semi-unknown structures, it’s simpler to write the packet one byte at a time. This code can be placed into an NPC “say” handler, and then you can trigger it by hailing an NPC. Tweak a value, reload quests, and repeat.

---

## Release Pipeline

*Source: developer/release-pipeline/index.html*

# Release Pipeline¶

## Introduction¶

Server binary releases are simple to create. The heavy lifting of releases are automatically handled by the build pipeline but require developers to execute a few small steps in order to execute them.

## Versioning¶

EQEmulator Server roughly follows semantic versioning https://semver.org/. 

```
`MAJOR version when you make incompatible API changes
MINOR version when you add functionality in a backwards compatible manner
PATCH version when you make backwards compatible bug fixes
`
```

We started at v22.1.0 because the project has been around for 22 years.

Version gets defined in **package.json** and it needs to be changed in order for the build pipeline to even consider building a release.

```
`{
 "name": "eqemu-server",
 "version": "22.1.0",
 "repository": {
 "type": "git",
 "url": "https://github.com/EQEmu/Server.git"
 }
}
`
```

Version also gets updated in **common/version.h** it's not as important as **package.json** - but it should be set to at least relatively identify what local version people are running within their codebase.

```
`#define CURRENT_VERSION "22.1.0-dev" // always append -dev to the current version for custom-builds
`
```

While `CURRENT_VERSION` should be updated manually for releases, it always gets written during the build pipeline.

## Changelog¶

The changelog informs users of what was changed within the release - so they can be aware of expected changes. 

It is one of the most effective and important tools to communicate change with users.

Changelog is kept in **CHANGELOG.md** and follows https://keepachangelog.com/en/1.0.0/

### What is a changelog?¶

A changelog is a file which contains a curated, chronologically ordered list of notable changes for each version of a project.

### Why keep a changelog?¶

To make it easier for users and contributors to see precisely what notable changes have been made between each release (or version) of the project.

### Who needs a changelog?¶

People do. Whether consumers or developers, the end users of software are human beings who care about what's in the software. When the software changes, people want to know why and how.

### What makes a good changelog?¶

**Guiding Principles**

- Changelogs are for humans, not machines.

- There should be an entry for every single version.

- The same types of changes should be grouped.

- Versions and sections should be linkable.

- The latest version comes first.

- The release date of each version is displayed.

- Mention whether you follow Semantic Versioning.

**Types of changes**

- **Added** for new features.

- **Changed** for changes in existing functionality.

- **Deprecated** for soon-to-be removed features.

- **Removed** for now removed features.

- **Fixed** for any bug fixes.

- **Security** in case of vulnerabilities.

### Contents¶

To build the base of the changelog, we built a tool to build out the scaffolding of the changelog contents. 

As of this writing it can be found here http://spire.akkadius.com/dev/changelog

This provides pull requests, suggest putting them in a section by them self called "Pull Requests" and providing other high level information above.

Choose the amount of days since the previous release to capture changes since then.

You may need to do some manual massaging of the content to make sure you don't have duplicate of what was potentially released in a version that was put out the same day or yesterday.

### Example Contents Diff¶

Below is an example of the changes needed to make a release

```
`diff --git a/CHANGELOG.md b/CHANGELOG.md
index 323dea8de..0d2ac4028 100644
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -1,3 +1,10 @@
+## [22.1.1] - 01/23/2022
+
+### Fixes
+
+* Fix botgrouplist to display unique entries. ([#2785](https://github.com/EQEmu/Server/pull/2785)) ([Aeadoin](https://github.com/Aeadoin)) 2023-01-23
+* Fix scenario where dereferenced object could be null. ([#2784](https://github.com/EQEmu/Server/pull/2784)) ([Aeadoin](https://github.com/Aeadoin)) 2023-01-23
+
 ## [22.1.0] - 01/22/2022

 This is a first release using the new build system. Changelog entry representative of last year. Subsequent releases will consist of incremental changes since the last release.
diff --git a/common/version.h b/common/version.h
index 79ad6b81b..5c47be7f1 100644
--- a/common/version.h
+++ b/common/version.h
@@ -25,7 +25,7 @@

 // Build variables
 // these get injected during the build pipeline
-#define CURRENT_VERSION "22.1.0-dev" // always append -dev to the current version for custom-builds
+#define CURRENT_VERSION "22.1.1-dev" // always append -dev to the current version for custom-builds
 #define LOGIN_VERSION "0.8.0"
 #define COMPILE_DATE __DATE__
 #define COMPILE_TIME __TIME__
diff --git a/package.json b/package.json
index 8f51d0ec9..4eaa1d797 100644
--- a/package.json
+++ b/package.json
@@ -1,6 +1,6 @@
 {
 "name": "eqemu-server",
- "version": "22.1.0",
+ "version": "22.1.1",
 "repository": {
 "type": "git",
 "url": "https://github.com/EQEmu/Server.git"
`
```

## Releasing¶

Once you have the above changes ready to go, merge it into master it will trigger a pipeline build and the pipeline will take care of the rest!

See Build Pipeline

## Release Analytics¶

We have an in-house tool built to track and manage releases and crash analytics for server developers.

It can be found at http://spire.akkadius.com/dev/releases

---

## Repositories

*Source: developer/repositories/index.html*

# Repositories¶

The purpose of this guide to serve as a reference for our source generated repositories and our use of the repository pattern in the server codebase

Info

The audience of this page is for EQEmulator developers

## What is the Repository Pattern?¶

"The simplest approach, especially with an existing system, is to create a new Repository implementation for each business object you need to store to or retrieve from your persistence layer. Further, you should only implement the specific methods you are calling in your application."

Info

Reference https://deviq.com/repository-pattern/

The underlying persistence layer could be anything, file, memory, remote storage, but in most cases relevant to what we are using repositories for right now in this article pertain to the database (MySQL)

### Benefits¶

- Simplified interaction with the database, instead of manually looking up columns, your IDE will autocomplete the struct fields that you are working with

- Heavily reducing the mental overhead of having to interact with the database at the programmatic level

- It creates an object representation of our tables (persistence layer) with a 1:1 mapping with what is in the source by having row values stored in a struct (Data Transfer Object)

- We reduce manual overhead by having code generation generate our database table representations

- Ease of maintenance; whenever we make schema changes, rerunning the repository updates fields and subsequent methods keeping code changes minimal

### **Methods Implemented in Base Repository**¶

- Single insertion covered by `InsertOne`

- Single update covered by `UpdateOne`

- Single delete covered by `DeleteOne`

- Single select covered by `FindOne`

- Bulk selection method via filtered `GetWhere(std::string where_filter)`

- Bulk deletion method via filtered `DeleteWhere(std::string where_filter)`

- Bulk insertion methods handled automatically via `InsertMany`

- Select all covered by `All`

### **Code Generation: Repository Generator**¶

The repository generator can be found in the source via the following path

```
`./utils/scripts/generators/repository-generator.pl
`
```

Linux BashWindows CMD

```
`# Command Structure
perl ~/code/utils/scripts/generators/repository-generator.pl [server-location] [table|all] [base|extended|all] [

# Generate everything
perl ~/code/utils/scripts/generators/repository-generator.pl ~/server/ all

# Only generate a repository for the account table
perl ~/code/utils/scripts/generators/repository-generator.pl ~/server/ account 

# Only generate base repositority for specific table
perl ~/code/utils/scripts/generators/repository-generator.pl ~/server/ account base
`
```

```
`# Command Structure
# Must be run from the root eqemu source folder
# [server-location] is the full path to server's world.exe location
E:\EQEmu\src>perl utils/scripts/generators/repository-generator.pl [server-location] [table|all] [base|extended|all]

# Generate everything
E:\EQEmu\src>perl utils/scripts/generators/repository-generator.pl E:\EQEmu\build\bin\Debug\ all

# Only generate a repository for the account table
E:\EQEmu\src>perl utils/scripts/generators/repository-generator.pl E:\EQEmu\build\bin\Debug\ account

# Only generate base repositority for specific table
E:\EQEmu\src>perl utils/scripts/generators/repository-generator.pl E:\EQEmu\build\bin\Debug\ account base
`
```

The generator works by examining your database tables found in the connection properties registered in the server config **eqemu_config** and will generate a **struct** object that tries to represent the database data types as close as possible

### Extending the Base Repository¶

The base repository is not meant to be touched manually; it is meant to provide generic scaffolding to the underlying persistence layer with generic methods typically needed

To implement your own customary methods you simply add your own methods in the extended repository, for each repository generated it outputs two files, the base repository (immutable) and the extended repository (mutable)

For example when we generate repositories from a single table we get both

`./common/repositories/base/base_instance_list_repository.h`

and

`./common/repositories/instance_list_repository.h`

The class structure in the non-base repository looks something like this 

```
`#include "../database.h"
#include "../string_util.h"
#include "base/base_instance_list_repository.h"

class InstanceListRepository: public BaseInstanceListRepository {
public:

 /**
 * This file was auto generated and can be modified and extended upon
 *
 * Base repository methods are automatically
 * generated in the "base" version of this repository. The base repository
 * is immutable and to be left untouched, while methods in this class
 * are used as extension methods for more specific persistence-layer
 * accessors or mutators.
 *
 * Base Methods (Subject to be expanded upon in time)
 *
 * Note: Not all tables are designed appropriately to fit functionality with all base methods
 *
 * InsertOne
 * UpdateOne
 * DeleteOne
 * FindOne
 * GetWhere(std::string where_filter)
 * DeleteWhere(std::string where_filter)
 * InsertMany
 * All
 *
 * Example custom methods in a repository
 *
 * InstanceListRepository::GetByZoneAndVersion(int zone_id, int zone_version)
 * InstanceListRepository::GetWhereNeverExpires()
 * InstanceListRepository::GetWhereXAndY()
 * InstanceListRepository::DeleteWhereXAndY()
 *
 * Most of the above could be covered by base methods, but if you as a developer
 * find yourself re-using logic for other parts of the code, its best to just make a
 * method that can be re-used easily elsewhere especially if it can use a base repository
 * method and encapsulate filters there
 */

 // Custom extended repository methods here

};
`
```

Pretty bare right? That's because it should be, this leaves the base repository free to be regenerated later by the repository generator if updates are supplied in the future and allows you to make all of your custom update / delete / find methods in the extended repository without requiring a ton of work to merge or update repositories

## Using Repositories in Server Code¶

Below we have an example implemented using our CLI menu interface to simply test some code

In **world_server_command_handler.cpp **we've registered a test command for testing repository code 

```
`/**
 * Register commands
 */
function_map["test:test"] = &WorldserverCommandHandler::TestCommand;
function_map["test:expansion"] = &WorldserverCommandHandler::ExpansionTestCommand;
function_map["test:repository"] = &WorldserverCommandHandler::TestRepository;
`
```

### Base Repository Contents (Truncated)¶

```
`class BaseInstanceListRepository {
public:
 struct InstanceList {
 int id;
 int zone;
 int version;
 int is_global;
 int start_time;
 int duration;
 int never_expires;
 };

 static std::string PrimaryKey()
 {
 return std::string("id");
 }

 static std::vector<std::string> Columns()
 {
 return {
 "id",
 "zone",
 "version",
 "is_global",
 "start_time",
 "duration",
 "never_expires",
 };
 }
 ...
`
```

### Command Code¶

```
`/**
 * @param argc
 * @param argv
 * @param cmd
 * @param description
 */
void TestRepository(int argc, char **argv, argh::parser &cmd, std::string &description)
{
 description = "Test command";

 if (cmd[{"-h", "--help"}]) {
 return;
 }

 /**
 * Insert one
 */
 auto instance_list_entry = InstanceListRepository::NewEntity();

 instance_list_entry.zone = 999;
 instance_list_entry.version = 1;
 instance_list_entry.is_global = 1;
 instance_list_entry.start_time = 0;
 instance_list_entry.duration = 0;
 instance_list_entry.never_expires = 1;

 auto instance_list_inserted = InstanceListRepository::InsertOne(instance_list_entry);

 LogInfo("Inserted ID is [{}] zone [{}]", instance_list_inserted.id, instance_list_inserted.zone);

 /**
 * Find one
 */
 auto found_instance_list = InstanceListRepository::FindOne(instance_list_inserted.id);

 LogInfo("Found ID is [{}] zone [{}]", found_instance_list.id, found_instance_list.zone);

 /**
 * Update one
 */
 LogInfo("Updating instance id [{}] zone [{}]", found_instance_list.id, found_instance_list.zone);

 int update_instance_list_count = InstanceListRepository::UpdateOne(found_instance_list);

 found_instance_list.zone = 777;

 LogInfo(
 "Updated instance id [{}] zone [{}] affected [{}]",
 found_instance_list.id,
 found_instance_list.zone,
 update_instance_list_count
 );

 /**
 * Delete one
 */
 int deleted = InstanceListRepository::DeleteOne(found_instance_list.id);

 LogInfo("Deleting one instance [{}] deleted count [{}]", found_instance_list.id, deleted);

 /**
 * Insert many
 */
 std::vector<InstanceListRepository::InstanceList> instance_lists;

 auto instance_list_entry_bulk = InstanceListRepository::NewEntity();

 instance_list_entry_bulk.zone = 999;
 instance_list_entry_bulk.version = 1;
 instance_list_entry_bulk.is_global = 1;
 instance_list_entry_bulk.start_time = 0;
 instance_list_entry_bulk.duration = 0;
 instance_list_entry_bulk.never_expires = 1;

 for (int i = 0; i < 10; i++) {
 instance_lists.push_back(instance_list_entry_bulk);
 }

 /**
 * Fetch all
 */
 int inserted_count = InstanceListRepository::InsertMany(instance_lists);

 LogInfo("Bulk insertion test, inserted [{}]", inserted_count);

 for (auto &entry: InstanceListRepository::GetWhere(fmt::format("zone = {}", 999))) {
 LogInfo("Iterating through entry id [{}] zone [{}]", entry.id, entry.zone);
 }

 /**
 * Delete where
 */
 int deleted_count = InstanceListRepository::DeleteWhere(fmt::format("zone = {}", 999));

 LogInfo("Bulk deletion test, deleted [{}]", deleted_count);

}
`
```

### Command Output¶

```
`./bin/world test:repository
[MySQL Query] INSERT INTO instance_list (zone, version, is_global, start_time, duration, never_expires) VALUES (999,1,1,0,0,1) (1 row affected) (0.000942s)
[WorldServer] [Info] Inserted ID is [3669] zone [999]
[MySQL Query] SELECT id, zone, version, is_global, start_time, duration, never_expires FROM instance_list WHERE id = 3669 LIMIT 1 (1 row returned) (0.000274s)
[WorldServer] [Info] Found ID is [3669] zone [999]
[WorldServer] [Info] Updating instance id [3669] zone [999]
[MySQL Query] UPDATE instance_list SET zone = 999, version = 1, is_global = 1, start_time = 0, duration = 0, never_expires = 1 WHERE id = 3669 (1 row affected) (0.000188s)
[WorldServer] [Info] Updated instance id [3669] zone [777] affected [1]
[MySQL Query] DELETE FROM instance_list WHERE id = 3669 (1 row affected) (0.000676s)
[WorldServer] [Info] Deleting one instance [3669] deleted count [1]
[MySQL Query] INSERT INTO instance_list (zone, version, is_global, start_time, duration, never_expires) VALUES (999,1,1,0,0,1),(999,1,1,0,0,1),(999,1,1,0,0,1),(999,1,1,0,0,1),(999,1,1,0,0,1),(999,1,1,0,0,1),(999,1,1,0,0,1),(999,1,1,0,0,1),(999,1,1,0,0,1),(999,1,1,0,0,1) (10 rows affected) (0.000456s)
[WorldServer] [Info] Bulk insertion test, inserted [10]
[MySQL Query] SELECT id, zone, version, is_global, start_time, duration, never_expires FROM instance_list WHERE zone = 999 (10 rows returned) (0.000219s)
[WorldServer] [Info] Iterating through entry id [3670] zone [999]
[WorldServer] [Info] Iterating through entry id [3671] zone [999]
[WorldServer] [Info] Iterating through entry id [3672] zone [999]
[WorldServer] [Info] Iterating through entry id [3673] zone [999]
[WorldServer] [Info] Iterating through entry id [3674] zone [999]
[WorldServer] [Info] Iterating through entry id [3675] zone [999]
[WorldServer] [Info] Iterating through entry id [3676] zone [999]
[WorldServer] [Info] Iterating through entry id [3677] zone [999]
[WorldServer] [Info] Iterating through entry id [3678] zone [999]
[WorldServer] [Info] Iterating through entry id [3679] zone [999]
[MySQL Query] DELETE FROM instance_list WHERE zone = 999 (10 rows affected) (0.000459s)
[WorldServer] [Info] Bulk deletion test, deleted [10]
`
```

You can see how we've had to use zero raw SQL to interact with the database in our actual domain logic; we can keep all of the SQL queries and interactions hidden behind methods created in our repositories and simply pass needed methods to those repository methods

## Another Example¶

Another real use example is where we need some additional criteria to pull some results from the database. Instead of querying for grids by zone using raw SQL we want to encapsulate some of this so it can be easily used in our domain logic. We could use `GetWhere` quickly, but to make a more re-usable method we're going to create some new methods for our pathing grids

- static std::vector GetZoneGrids(int zone_id) 

- static Grid GetGrid(const std::vector &grids, int grid_id)

```
` // Custom extended repository methods here

 static std::vector<Grid> GetZoneGrids(int zone_id)
 {
 std::vector<Grid> grids;

 auto results = content_db.QueryDatabase(
 fmt::format(
 "{} WHERE zoneid = {}",
 BaseSelect(),
 zone_id
 )
 );

 for (auto row = results.begin(); row != results.end(); ++row) {
 Grid entry{};

 entry.id = atoi(row[0]);
 entry.zoneid = atoi(row[1]);
 entry.type = atoi(row[2]);
 entry.type2 = atoi(row[3]);

 grids.push_back(entry);
 }

 return grids;
 }

 static Grid GetGrid(
 const std::vector<Grid> &grids,
 int grid_id
 )
 {
 for (auto &row : grids) {
 if (row.id == grid_id) {
 return row;
 }
 }

 return NewEntity();
 }
`
```

Since we want these records to be cached at the zone level; we create two properties to eventually load via data that is zone contextual

```
`class Zone {
...
 std::vector<GridRepository::Grid> zone_grids;
 std::vector<GridEntriesRepository::GridEntry> zone_grid_entries;
`
```

We created a function that during zone initialization we call **LoadGrids **so we can reuse it in other parts of the code if we wanted to reload grid data for any reason

```
`void Zone::LoadGrids()
{
 zone_grids = GridRepository::GetZoneGrids(GetZoneID());
 zone_grid_entries = GridEntriesRepository::GetZoneGridEntries(GetZoneID());
}
`
```

Since we have this data in memory now using the structure directly mapped from the repositories, we also have this very nice way over iterating over the data in a vector when it comes to load the data into the grids / waypoints themselves

```
`void NPC::AssignWaypoints ...
...

for (auto &entry : zone->zone_grid_entries) {
 if (entry.gridid == grid_id) {
 wplist new_waypoint{};
 new_waypoint.index = max_wp;
 new_waypoint.x = entry.x;
 new_waypoint.y = entry.y;
 new_waypoint.z = entry.z;
 new_waypoint.pause = entry.pause;
 new_waypoint.heading = entry.heading;
 new_waypoint.centerpoint = entry.centerpoint;

 LogPathing(
 "Loading Grid [{}] number [{}] name [{}]",
 grid_id,
 entry.number,
 GetCleanName()
 );

 Waypoints.push_back(new_waypoint);
 max_wp++;
 }
 }
`
```

---

## Useful Links

*Source: developer/useful-links/index.html*

# Useful Links¶

## Repositories¶

| 

**Name** 
| **Description** 
| **Link** 

| The Grand Library 
| Compilation of repositories 
| https://gitlab.com/TheGrandLibrary 

| EQEmu 
| Main Repo for EQEmulator 
| https://github.com/EQEmu/Server 

| ProjectEQ Database 
| PEQ Database daily dumps for EQEmu 
| https://db.eqemu.dev/ 

| ProjectEQ Quests 
| Quests Repo for ProjectEQ 
| https://github.com/ProjectEQ/projecteqquests 

| EQEmu Maps 
| Base, Nav, Water and Pathing maps for EQEmu 
| https://github.com/EQEmu/maps 

| EQEmu Docs 
| Docs Repo for EQEmulator 
| https://github.com/EQEmu/eqemu-docs-v2 

| Allaclone 
| Allakhazam Clone for EQEmulator 
| https://github.com/EQEmuTools/EQEmuAllakhazamClone 

| CharBrowser 
| Magelo Clone for EQEmulator 
| https://github.com/maudigan/charbrowser 

| Spire 
| A rich, portable server editing and development toolkit for EverQuest Emulator servers 
| https://github.com/EQEmuTools/spire 

| PEQPHPEditor 
| Full-Featured PHP Editor for EQEmulator 
| https://github.com/ProjectEQ/peqphpeditor 

| EQEmu EOC 
| Deprecated Editor with some still useful tools 
| https://github.com/EQEmuTools/EQEmuEOC 

| EQEmuPatcher 
| Auto Patcher for EQEmu Servers 
| https://github.com/xackery/eqemupatcher 

| TalkEQ 
| Bridges links between everquest and other services 
| https://github.com/xackery/talkeq 

| Zone-Utilities 
| Various utilities and libraries for parsing, rendering and manipulating EQ Zone files 
| https://github.com/EQEmu/zone-utilities 

| MacroQuest 
| An open source scripting and plugin platform for EverQuest 
| https://github.com/macroquest/macroquest 

| MQ2TakeADump 
| Allows you to dump EQ information out to CSV files, such as doors, groundspawns, objects, NPCs, current zone and zonepoints 
| https://github.com/maudigan/MQ2TakeADump 

| eq-core-dll 
| Core DLL for EverQuest to do patching, opt in to features 
| https://github.com/xackery/eq-core-dll/ 

| EQEmuParticleEditor 
| Particle Editor for EQEmu 
| https://github.com/Zaela/EQEmuParticleEditor 

| EQGWeaponModelImporter 
| EQG Weapon Model Importer for EQEmu 
| https://github.com/Zaela/EQGWeaponModelImporter 

| EQGZoneImporter 
| EQEmu Zone Importer 
| https://github.com/Zaela/EQGZoneImporter 

| S3DModelExtracter 
| S3D Model Extracter for EQEmu 
| https://github.com/Zaela/S3DModelExtracter 

| EQTools (Georges2ools) 
| Modern Remake of George's Tools by Entelion 
| https://github.com/cdub321/EQTOOLS 

## Online Server Tools/References¶

| 

**Name** 
| **Description** 
| **Link** 

| EOC 
| Online Deprecated Editor with some still useful tools 
| https://eoc.eqemu.dev/ 

| Quest-API Introduction 
| Introduction to EQEmu Quest API 
| https://docs.eqemu.dev/quest-api/introduction/ 

| Spire 
| Online rich, portable server editing and development toolkit for EverQuest Emulator servers 
| https://spire.eqemu.dev/ 

| Allaclone Website 
| Online Allakhazam Clone for EQEmu PEQ Database 
| https://alla.eqemu.dev/ 

| Shendare's Race Inventory 
| Find all races per zone and the associated _chr links 
| http://www.shendare.com/EQ/Emu/EQRI/ 

## Gameplay Tools¶

| 

**Tool** 
| **Description** 
| **Link** 

| DerpleTools - rgmercs 
| Automation with ability to create custom logic for each class including reasonable default logic for Live and some popular EMUs 
| https://github.com/DerpleMQ2/rgmercs 

| DerpleTools - vendor 
| Vendor tool that attaches to your vendor window and makes selling faster. Including Automated selling of Junk Items 
| https://github.com/DerpleMQ2/vendor 

| DerpleTools - parcel 
| Parcel tool that finds parcel merchants in zone and can auto send items based on criteria that can be customized 
| https://github.com/DerpleMQ2/parcel 

| DerpleTools - bazaar 
| Bazaar pricing and historical tracking tool 
| https://github.com/DerpleMQ2/bazaar 

| DerpleTools - buttonmaster 
| Hotbar replacement with LUA and Icon Support. 
| https://github.com/DerpleMQ2/buttonmaster 

| EmuBot 
| All-In-One bot management and inventory viewer 
| https://github.com/andude2/EmuBot 

| GamParse 
| Log Viewer, Parser, Overlay 
| https://elitegamerslounge.com/home/gamparse/GamParse-2.0.0-Beta.exe 

| EQLogParser 
| Log Viewer, Parser, Audio Triggers, Overlay 
| https://github.com/kauffman12/EQLogParser 

| RaidLoot LogSync 
| Limited Feature Parser 
| https://s3.amazonaws.com/raidloot/logsync.exe 

| GINA 
| Audio Triggers 
| https://github.com/smasherprog/Gina/releases 

| EQNag 
| Audio Triggers, Overlay, Floating Combat Text 
| https://github.com/guildantix/eq-nag/releases 

| EZInventory 
| MacroQuest lua script to help facilitate inventory management across all of your connected characters 
| https://github.com/andude2/EZInventory 

| EZBots 
| MacroQuest lua script to help monitor all your connected bots 
| https://github.com/andude2/EZBots 

| smartloot 
| Loot Manager and AutoLoot MacroQuest lua script for EQEmu 
| https://github.com/andude2/smartloot 

| VegasLoot 
| Autoloot Plugin for MacroQuest 
| https://www.dropbox.com/scl/fi/1di5aji4vseox7hlrkjks/MQ2VegasLoot.dll?rlkey=f1o79blqpx8fpifvr7g5m66jr&dl=0 

## Raw Server Import SQLs for Bots and Mercs¶

| 

**Name** 
| **Link** 

| Bot Tables Bootstrap 
| https://raw.githubusercontent.com/EQEmu/Server/master/utils/sql/bot_tables_bootstrap.sql 

| Merc Tables Bootstrap 
| https://raw.githubusercontent.com/EQEmu/Server/master/utils/sql/merc_tables_bootstrap.sql 

## AkkStack References¶

| 

**Name** 
| **Link** 

| Akk-Stack 
| https://github.com/EQEmuTools/akk-stack 

| Akk-Stack-Introduction 
| https://docs.eqemu.dev/akk-stack/introduction/ 

| Akk-Stack-Installation 
| https://docs.eqemu.dev/akk-stack/installation/ 

| Akk-Stack-Backups 
| https://docs.eqemu.dev/akk-stack/operate/backups/ 

| Akk-Stack-Services 
| https://docs.eqemu.dev/akk-stack/operate/services/ 

| Akk-Stack-Update 
| https://docs.eqemu.dev/akk-stack/operate/update/ 

## Docker References¶

| 

**Name** 
| **Link** 

| Docker Image Collection 
| https://hub.docker.com/u/eqemulator

---

