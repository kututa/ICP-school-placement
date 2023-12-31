// Importing necessary modules from the 'azle' library and 'uuid' library
import {
  $query,
  $update,
  StableBTreeMap,
  Vec,
  match,
  Result,
  nat64,
  ic,
  Opt,
  Principal,
  Record,
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
  level: string;
  county: string;
}>;

type Student = Record<{
  id: string;
  name: string;
  phone: string;
  marks: number;
  county: string;
  highschool: Highschool;
}>;

type HighschoolPayload = Record<{
  name: string;
  phone: string;
  level_out_of_4: number;
  county: string;
}>;

type UpdateHighschoolPayload = Record<{
  id: string;
  level: string;
  phone: string;
}>;

type StudentPayload = Record<{
  name: string;
  phone: string;
  marks_out_of_1000: number;
  county: string;
}>;

type CarResponse = Record<{
  msg: string;
  price: number;
}>;

// Creating instances of StableBTreeMap for each entity type
const ministryStorage = new StableBTreeMap<string, Ministry>(0, 44, 512);
const studentStorage = new StableBTreeMap<string, Student>(2, 44, 512);
const highschoolStorage = new StableBTreeMap<string, Highschool>(3, 44, 512);

// Initialization of ministryStorage
$update;
export function initMinistry(): Result<Ministry, string> {
  try {
    // Validate that the ministry has not been initialized already
    if (!ministryStorage.isEmpty()) {
      return Result.Err<Ministry, string>(
        "Ministry has already been initialized"
      );
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

// check if the person making the request is the ministry
function isMinistry(caller: string): boolean {
  const ministry = ministryStorage.values()[0];
  return ministry.ministry.toText() !== caller;
}

$update;
// Function to add a new highschool
export function addHighschool(
  payload: HighschoolPayload
): Result<Highschool, string> {
  try {
    // Validate that the ministry exists
    if (ministryStorage.isEmpty()) {
      return Result.Err(
        "Ministry has not been initialized, init ministry first"
      );
    }

    // Check if the caller is the ministry
    if (isMinistry(ic.caller().toText())) {
      return Result.Err("Action reserved for the ministry");
    }

    // Validate the payload
    if (
      !payload.name ||
      !payload.county ||
      !payload.level_out_of_4 ||
      !payload.phone
    ) {
      return Result.Err("Incomplete input data!");
    }

    const level =
      payload.level_out_of_4 > 3
        ? "NATIONAL"
        : payload.level_out_of_4 > 2
        ? "COUNTY"
        : payload.level_out_of_4 > 1
        ? "SUB-COUNTY"
        : "DISTRICT";

    // Create a new highschool
    const highschool: Highschool = {
      id: uuidv4(),
      name: payload.name,
      phone: payload.phone,
      level: level,
      county: payload.county,
    };

    // Insert the highschool into highschoolStorage
    highschoolStorage.insert(highschool.id, highschool);

    return Result.Ok(highschool);
  } catch (error) {
    return Result.Err("Failed to add highschool");
  }
}

$query;
// get highschool by id
export function getHighschool(id: string): Result<Highschool, string> {
  try {
    // Validate the ID
    if (!id) {
      return Result.Err("Invalid ID");
    }

    // Get the highschool
    const highschoolResult = highschoolStorage.get(id);

    // Use match to handle the Result type
    return match(highschoolResult, {
      Some: (highschool) => Result.Ok<Highschool, string>(highschool),
      None: () =>
        Result.Err<Highschool, string>(`Highschool id: ${id} not found`),
    });
  } catch (error) {
    return Result.Err("Failed to get highschool");
  }
}

$query;
// get all highschools
export function getAllHighschools(): Result<Vec<Highschool>, string> {
  try {
    // Get all highschools
    const highschools = highschoolStorage.values();

    // check if there are any highschools
    if (highschools.length === 0) {
      return Result.Err<Vec<Highschool>, string>(
        "No highschools found, add them first"
      );
    }

    return Result.Ok<Vec<Highschool>, string>(highschools);
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
    if (filteredHighschools.length === 0) {
      return Result.Err<Vec<Highschool>, string>(
        "No highschools found, add them first"
      );
    }

    return Result.Ok<Vec<Highschool>, string>(filteredHighschools);
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
    if (filteredHighschools.length === 0) {
      return Result.Err<Vec<Highschool>, string>(
        "No highschools found, add them first"
      );
    }

    return Result.Ok<Vec<Highschool>, string>(filteredHighschools);
  } catch (error) {
    return Result.Err("Failed to search highschools");
  }
}

$query;
// search highschool by level
export function searchHighschoolByLevel(
  level: number
): Result<Vec<Highschool>, string> {
  try {
    // Validate the level
    if (!level) {
      return Result.Err("Invalid level");
    }

    // Get all highschools
    const highschools = highschoolStorage.values();

    const abslevel =
      level > 3
        ? "NATIONAL"
        : level > 2
        ? "COUNTY"
        : level > 1
        ? "SUB-COUNTY"
        : "DISTRICT";

    // Filter the highschools by level
    const filteredHighschools = highschools.filter(
      (highschool) => highschool.level === abslevel
    );

    // check if there are any highschools
    if (filteredHighschools.length === 0) {
      return Result.Err<Vec<Highschool>, string>(
        "No highschools found, add them first"
      );
    }

    return Result.Ok<Vec<Highschool>, string>(filteredHighschools);
  } catch (error) {
    return Result.Err("Failed to search highschools");
  }
}

$update;
//  function to add a new student
export function addStudent(payload: StudentPayload): Result<Student, string> {
  try {
    // Validate the payload
    if (
      !payload.name ||
      !payload.county ||
      !payload.marks_out_of_1000 ||
      !payload.phone
    ) {
      return Result.Err("Incomplete input data!");
    }

    // Check if the caller is the contract ministry
    if (isMinistry(ic.caller().toText())) {
      return Result.Err("Action reserved for the contract ministry");
    }

    // place student
    return match(placeStudent(payload.marks_out_of_1000), {
      Ok: (highschool) => {
        if (!highschool.id) {
          return Result.Err<Student, string>(
            `No highschool available for that marks level, consider adding highschools for each level`
          );
        }

        // Create a new student
        const student: Student = {
          id: uuidv4(),
          name: payload.name,
          phone: payload.phone,
          marks: payload.marks_out_of_1000,
          county: payload.county,
          highschool: highschool,
        };

        // Insert the student into studentStorage
        studentStorage.insert(student.id, student);

        return Result.Ok<Student, string>(student);
      },
      Err: (error) => Result.Err<Student, string>(error),
    });
  } catch (error) {
    return Result.Err<Student, string>(`Failed to add student due to ${error}`);
  }
}

// place student to highschool according to their markss
function placeStudent(marks: number): Result<Highschool, string> {
  try {
    // Get the highschool
    const highschools = highschoolStorage.values();

    // Use match to. handle the Result type
    if (highschools.length == 0) {
      return Result.Err<Highschool, string>(
        "No highschools found, add them first"
      );
    }

    let returnSchool: Highschool = {} as unknown as Highschool;

    highschools.forEach((highschool) => {
      const marksLevel =
        marks >= 800
          ? "NATIONAL"
          : marks >= 500
          ? "COUNTY"
          : marks >= 300
          ? "SUB-COUNTY"
          : "DISTRICT";

      // Check if the student's marks matches the highschool's level
      if (marksLevel !== highschool.level) {
        return Result.Err<Highschool, string>(
          "Student's marks does not match the highschool's level"
        );
      }
      returnSchool = highschool;
    });
    return Result.Ok<Highschool, string>(returnSchool);
    // return Result.Err<Highschool, string>("could not place student");
  } catch (error) {
    return Result.Err<Highschool, string>(
      `failed to place student due to ${error}`
    );
  }
}

$update;
// Function to update information for a highschool
export function updateHighschool(
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

    // Get the highschool
    const highschoolResult = highschoolStorage.get(payload.id);

    // Use match to handle the Result type
    return match(highschoolResult, {
      Some: (highschool) => {
        // Update the highschool information
        highschool.level = payload.level;
        highschool.phone = payload.phone;

        // Insert the updated highschool into highschoolStorage
        highschoolStorage.insert(highschool.id, highschool);

        return Result.Ok<Highschool, string>(highschool);
      },
      None: () =>
        Result.Err<Highschool, string>("Highschool not found, add them first"),
    });
  } catch (error) {
    return Result.Err<Highschool, string>("Failed to update highschool");
  }
}

$query;
// search student by name
export function searchStudentByName(
  name: string
): Result<Vec<Student>, string> {
  try {
    // Validate the name
    if (!name) {
      return Result.Err("Invalid name");
    }

    // Get all students
    const students = studentStorage.values();

    // Filter the students by name
    const filteredStudents = students.filter((student) =>
      student.name.toLowerCase().includes(name.toLowerCase())
    );

    // check if there are any students
    if (filteredStudents.length === 0) {
      return Result.Err<Vec<Student>, string>("No students found");
    }

    return Result.Ok<Vec<Student>, string>(filteredStudents);
  } catch (error) {
    return Result.Err("Failed to search students");
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
