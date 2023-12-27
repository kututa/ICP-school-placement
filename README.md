# School Placement System

## Overview

This ICP smart contract places students to different levels of high schools based on their marks. Impliments Highschools, Students, with specific functionalities to add, retrieve, and update information. It also incorporates permission checks and security measures to ensure proper access control. The student placement mechanism adds a layer of complexity by considering marks for high school assignment.

## Prerequisites

- Node
- Typescript
- DFX
- IC CDK

## Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/kututa/ICP-school-placement.git
    cd ICP-school-placement
    ```

### Overview of the Inventory Management ICP Smart Contract:

#### 1. **Imported Modules:**

   - Import necessary modules from the 'azle' library for interacting with the Internet Computer Protocol, including functions like `$query`, `$update`, and various data types like `StableBTreeMap`, `Vec`, `match`, `Result`, `nat64`, `ic`, `Opt`, `Principal`, and `Record`.
   - Import the `uuid` library for generating unique identifiers.

#### 2. Record Types

   - Define TypeScript record types for different entities within the inventory system:
     - `Ministry`: Represents a ministry with an ID and associated principal.
     - `Highschool`: Represents a high school with an ID, name, phone, level, and county.
     - `Student`: Represents a student with an ID, name, phone, marks, county, and associated high school.
     - `HighschoolPayload`: Represents the payload for adding a new high school.
     - `UpdateHighschoolPayload`: Represents the payload for updating high school information.
     - `StudentPayload`: Represents the payload for adding a new student.
     - `CarResponse`: Represents the response for car-related actions.

#### 3. Storage Instances

   - Create instances of `StableBTreeMap` for storing information about ministries, high schools, and students.

#### 4. Initialization Function

   - `initMinistry()` to initialize the ministry, ensuring it has not been initialized already.

#### 5. Permission and Authentication

   - Define `isMinistry` to check if the caller is the ministry.

#### 6. High School Functions

   - `addHighschool(payload: HighschoolPayload)` to add a new high school, validating input data, ministry existence, and caller identity.
   - `getHighschool(id: string)` to get information about a high school by ID.
   - `getAllHighschools()` to get a list of all high schools.
   - `searchHighschoolByName(name: string)` to search for high schools by name.
   - `searchHighschoolByCounty(county: string)` to search for high schools by county.
   - `searchHighschoolByLevel(level: string)` to search for high schools by level.
   - `updateHighschoolSlot(payload: UpdateHighschoolPayload)` to update information for a high school, validating input data and caller identity.
   - `deleteHighschoolSlot(id: string)` to delete a high school slot, validating the ID and caller identity.

#### 7. Student Functions

   - `addStudent(payload: StudentPayload)` to add a new student, validating input data, ministry existence, and caller identity. Uses `placeStudent` to determine the high school placement based on marks.
   - `placeStudent(marks: number)` to determine the high school placement based on marks.

#### 8. Utility Functions

   - `placeStudent(marks: number)`: Determines the appropriate high school placement based on student marks.

#### 9. Testing and Mocking

   - Mock the 'crypto' object for testing purposes.

#### 10. Security Measures

   - security measures to ensure that actions are reserved for the ministry or contract ministry as appropriate.

## Try it out

`dfx` is the tool you will use to interact with the IC locally and on mainnet. If you don't already have it installed:

```bash
npm run dfx_install
```

Next you will want to start a replica, which is a local instance of the IC that you can deploy your canisters to:

```bash
npm run replica_start
```

If you ever want to stop the replica:

```bash
npm run replica_stop
```

Now you can deploy your canister locally:

```bash
npm install
npm run canister_deploy_local
```

To call the methods on your canister:

```bash
npm run name_of_function
npm run name_of_function
```

Assuming you have [created a cycles wallet](https://internetcomputer.org/docs/current/developer-docs/quickstart/network-quickstart) and funded it with cycles, you can deploy to mainnet like this:

```bash
npm run canister_deploy_mainnet
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
