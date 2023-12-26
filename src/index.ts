// Importing necessary modules from the 'azle' library and 'uuid' library
import {
  $query,
  $update,
  Record,
  StableBTreeMap,
  Vec,
  match,
  Result,
  nat64,
  ic,
  Opt,
  Principal,
} from "azle";
import { v4 as uuidv4 } from "uuid";

// Defining record types for different entities
type Ministry = Record<{
  id: string;
  ministry: Principal;
}>;

type Highschool = Record<{
  id: string;
  name: string;
  phone: string;
  level: SchoolLevel;
  county: string;
}>;

type Placement = Record<{
  id: string;
  highschool: Principal;
  student: Principal;
}>;

type Student = Record<{
  id: string;
  name: string;
  phone: string;
  grade: Grade;
  county: string;
  highschool: Highschool | undefined;
}>;

type HighschoolPayload = Record<{
  name: string;
  phone: string;
  level: SchoolLevel;
  county: string;
}>;

type UpdateHighschoolPayload = Record<{
  id: string;
  level: SchoolLevel;
  phone: string;
}>;

enum SchoolLevel {
  NATIONAL = "NATIONAL",
  COUNTY = "COUNTY",
  SUB_COUNTY = "SUB_COUNTY",
  DISTRICT = "DISTRICT",
  DAYSCHOOL = "DAYSCHOOL",
}

enum Grade {
  A1 = "A+",
  A2 = "A",
  A3 = "A-",
  B1 = "B+",
  B2 = "B",
  B3 = "B-",
  C1 = "C+",
  C2 = "C",
  C3 = "C-",
  D1 = "D+",
  D2 = "D",
  D3 = "D-",
}

type StudentPayload = Record<{
  name: string;
  phone: string;
  grade: Grade;
  county: string;
}>;

type CarResponse = Record<{
  msg: string;
  price: number;
}>;

// Creating instances of StableBTreeMap for each entity type
const ministryStorage = new StableBTreeMap<string, Ministry>(0, 44, 512);
const placementStorage = new StableBTreeMap<string, Placement>(1, 44, 512);
const studentStorage = new StableBTreeMap<string, Student>(2, 44, 512);
const highschoolStorage = new StableBTreeMap<string, Highschool>(3, 44, 512);

// Initialization of ministryStorage
$update;

$update;
// Function to add a new highschool
export function addHighschool(
  payload: HighschoolPayload
): Result<string, string> {
  try {
    // Validate that the ministry exists
    if (ministryStorage.isEmpty()) {
      return Result.Err("Ministry has not been initialized");
    }

    // Check if the caller is the ministry
    if (isMinistry(ic.caller().toText())) {
      return Result.Err("Action reserved for the ministry");
    }

    // Validate the payload
    if (!payload.name || !payload.county || !payload.level || !payload.phone) {
      return Result.Err("Incomplete input data!");
    }

    // Create a new highschool slot
    const highschool: Highschool = {
      id: uuidv4(),
      name: payload.name,
      phone: payload.phone,
      level: payload.level,
      county: payload.county,
    };

    // Insert the highschool slot into highschoolStorage
    highschoolStorage.insert(highschool.id, highschool);

    return Result.Ok(highschool.id);
  } catch (error) {
    return Result.Err("Failed to add highschool slot");
  }
}

// Initialization of ministryStorage
$update;
export function initMinistry(): Result<Ministry, string> {
  try {
    // Validate that the ministry has not been initialized already
    if (isMinistryInitialized()) {
      return Result.Err<Ministry, string>("Ministry has already been initialized");
    }

    // Create a new ministry
    const ministry: Ministry = {
      id: uuidv4(),
      ministry: ic.caller(),
    };

    // Insert the ministry into ministryStorage
    ministryStorage.insert(ministry.id, ministry);

    return Result.Ok(ministry);
  } catch (error) {
    return Result.Err<Ministry, string>("Failed to initialize ministry");
  }
}
// Check if the ministry has been initialized
function isMinistryInitialized(): boolean {
  return !ministryStorage.isEmpty();
}

// check if the person making the request is the ministry
function isMinistry(caller: string): boolean {
  const ministry = getMinistry();
  return ministry && ministry.ministry.toText() !== caller;
}

// Get the ministry from storage
function getMinistry(): Ministry | undefined {
  const ministries = ministryStorage.values();
  return ministries.length > 0 ? ministries[0] : undefined;
}

// Function to add a new highschool
export function addHighschool(payload: HighschoolPayload): Result<string, string> {
  try {
    // Validate that the ministry exists
    const ministry = getMinistry();
    if (!ministry) {
      return Result.Err("Ministry has not been initialized");
    }

    // Check if the caller is the ministry
    if (isMinistry(ic.caller().toText())) {
      return Result.Err("Action reserved for the ministry");
    }

    // Validate the payload
    const { name, county, level, phone } = payload;
    if (!name || !county || !level || !phone) {
      return Result.Err("Incomplete input data!");
    }
    // Create a new highschool slot
    const highschool: Highschool = {
      id: uuidv4(),
      name,
      phone,
      level,
      county,
    };

    // Insert the highschool slot into highschoolStorage
    highschoolStorage.insert(highschool.id, highschool);

    return Result.Ok(highschool.id);
  } catch (error) {
    return Result.Err("Failed to add highschool slot");
  }
}

$query;
// get all highschools
export function getAllHighschools(): Result<Vec<Highschool>, string> {
  try {
    // Get all highschools
    const highschools = highschoolStorage.values();

    // check if there are any highschools
    return match(highschools, {
      0: () => Result.Err<Vec<Highschool>, string>("No highschools found"),
      _: () => Result.Ok<Vec<Highschool>, string>(highschools),
    });
  } catch (error) {
    return Result.Err("Failed to get highschools");
  }
}

$query;
// search highshool by name
export function searchHighschoolByName(
  name: string
): Result<Vec<Highschool>, string> {
  try {
    // Validate the name
    if (!name) {
      return Result.Err("Invalid name");
    }

    // Get all highschools
    const highschools = highschoolStorage.values();

    // Filter the highschools by name
    const filteredHighschools = highschools.filter((highschool) =>
      highschool.name.toLowerCase().includes(name.toLowerCase())
    );

    // check if there are any highschools
    return match(filteredHighschools, {
      0: () => Result.Err<Vec<Highschool>, string>("No highschools found"),
      _: () => Result.Ok<Vec<Highschool>, string>(filteredHighschools),
    });
  } catch (error) {
    return Result.Err("Failed to search highschools");
  }
}

$query;
// search highschool by county
export function searchHighschoolByCounty(
  county: string
): Result<Vec<Highschool>, string> {
  try {
    // Validate the county
    if (!county) {
      return Result.Err("Invalid county");
    }

    // Get all highschools
    const highschools = highschoolStorage.values();

    // Filter the highschools by county
    const filteredHighschools = highschools.filter((highschool) =>
      highschool.county.toLowerCase().includes(county.toLowerCase())
    );

    // check if there are any highschools
    return match(filteredHighschools, {
      0: () => Result.Err<Vec<Highschool>, string>("No highschools found"),
      _: () => Result.Ok<Vec<Highschool>, string>(filteredHighschools),
    });
  } catch (error) {
    return Result.Err("Failed to search highschools");
  }
}

$query;
// search highschool by level
export function searchHighschoolByLevel(
  level: SchoolLevel
): Result<Vec<Highschool>, string> {
  try {
    // Validate the level
    if (!level) {
      return Result.Err("Invalid level");
    }

    // Get all highschools
    const highschools = highschoolStorage.values();

    // Filter the highschools by level
    const filteredHighschools = highschools.filter(
      (highschool) => highschool.level === level
    );

    // check if there are any highschools
    return match(filteredHighschools, {
      0: () => Result.Err<Vec<Highschool>, string>("No highschools found"),
      _: () => Result.Ok<Vec<Highschool>, string>(filteredHighschools),
    });
  } catch (error) {
    return Result.Err("Failed to search highschools");
  }
}

$update;
//  function to add a new student
export function addStudent(payload: StudentPayload): Result<Student, string> {
  try {
    // Validate the payload
    if (!payload.name || !payload.county || !payload.grade || !payload.phone) {
      return Result.Err("Incomplete input data!");
    }

    // Create a new student
    const student: Student = {
      id: uuidv4(),
      name: payload.name,
      phone: payload.phone,
      grade: payload.grade,
      county: payload.county,
      highschool: undefined,
    };

    // Insert the student into studentStorage
    studentStorage.insert(student.id, student);

    return Result.Ok(student);
  } catch (error) {
    return Result.Err("Failed to add student");
  }
}

$update;
// Function to update information for a highschool slot
export function updateHighschoolSlot(
  payload: UpdateHighschoolPayload
): Result<Highschool, string> {
  try {
    // Validate the ID
    if (!payload.id) {
      return Result.Err("Invalid ID");
    }

    // Check if the caller is the contract ministry
    if (isMinistry(ic.caller().toText())) {
      return Result.Err("Action reserved for the contract ministry");
    }

    // Validate the payload
    if (!payload.level || !payload.phone) {
      return Result.Err("Incomplete input data!");
    }

    // Get the highschool slot
    const highschoolResult = highschoolStorage.get(payload.id);

    // Use match to handle the Result type
    return match(highschoolResult, {
      Some: (highschool) => {
        // Update the highschool slot information
        highschool.level = payload.level;
        highschool.phone = payload.phone;

        // Insert the updated highschool slot into highschoolStorage
        highschoolStorage.insert(highschool.id, highschool);

        return Result.Ok<Highschool, string>(highschool);
      },
      None: () => Result.Err<Highschool, string>("Highschool slot not found"),
    });
  } catch (error) {
    return Result.Err<Highschool, string>("Failed to update highschool slot");
  }
}

$update;
// Function to delete a highschool slot
export function deleteHighschoolSlot(id: string): Result<string, string> {
  try {
    // Validate the ID
    if (!id) {
      return Result.Err("Invalid ID");
    }

    // Check if the caller is the contract ministry
    if (isMinistry(ic.caller().toText())) {
      return Result.Err("Action reserved for the contract ministry");
    }

    // Remove the highschool slot from highschoolStorage
    highschoolStorage.remove(id);

    return Result.Ok(`Highschool slot of ID: ${id} removed successfully`);
  } catch (error) {
    return Result.Err("Failed to delete highschool slot");
  }
}

// Mocking the 'crypto' object for testing purposes
globalThis.crypto = {
  // @ts-ignore
  getRandomValues: () => {
    let array = new Uint8Array(32);

    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }

    return array;
  },
};
