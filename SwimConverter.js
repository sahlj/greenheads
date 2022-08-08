'use strict';

const Gender = {
    MENS: "M",
    WOMENS: "W"
}; // Gender

const Organization = {
    USAS: 'USAS',
    NFHS: 'NFHS',
    NCAA: 'NCAA'
}; // Organization

const Stroke = {
    Freestyle: 'Freestyle',
    Backstroke: 'Backstroke',
    Breaststroke: 'Breaststroke',
    Butterfly: 'Butterfly',
    IndividualMedley: 'Individual Medley'
}; // Stroke

const Course = {
    SCY: 'Y',
    SCM: 'S',
    LCM: 'L'
}; // Course

function createNfhsFactors() {
    const mensFactorMap = new Map();
    const mFreeMap = new Map();
    mFreeMap.set(50, 0.8937);
    mFreeMap.set(100, 0.9001);
    mFreeMap.set(200, 0.9025);
    mFreeMap.set(400, 1.139);
    mFreeMap.set(500, 1.139);
    mensFactorMap.set(Stroke.Freestyle, mFreeMap);
    const mBackMap = new Map();
    mBackMap.set(100, 0.9001);
    mensFactorMap.set(Stroke.Backstroke, mBackMap);
    const mBreastMap = new Map();
    mBreastMap.set(100, 0.9009);
    mensFactorMap.set(Stroke.Breaststroke, mBreastMap);
    const mFlyMap = new Map();
    mFlyMap.set(100, 0.8977);
    mensFactorMap.set(Stroke.Butterfly, mFlyMap);
    const mIMMap = new Map();
    mIMMap.set(200, 0.9001);
    mensFactorMap.set(Stroke.IndividualMedley, mIMMap);

    const womensFactorMap = new Map();
    const wFreeMap = new Map();
    wFreeMap.set(50, 0.8969);
    wFreeMap.set(100, 0.8993);
    wFreeMap.set(200, 0.9025);
    wFreeMap.set(400, 1.140);
    wFreeMap.set(500, 1.140);
    womensFactorMap.set(Stroke.Freestyle, wFreeMap);
    const wBackMap = new Map();
    wBackMap.set(100, 0.9001);
    womensFactorMap.set(Stroke.Backstroke, wBackMap);
    const wBreastMap = new Map();
    wBreastMap.set(100, 0.8993);
    womensFactorMap.set(Stroke.Breaststroke, wBreastMap);
    const wFlyMap = new Map();
    wFlyMap.set(100, 0.9001);
    womensFactorMap.set(Stroke.Butterfly, wFlyMap);
    const wIMMap = new Map();
    wIMMap.set(200, 0.9009);
    womensFactorMap.set(Stroke.IndividualMedley, wIMMap);

    const factorMap = new Map();
    factorMap.set(Gender.MENS, mensFactorMap);
    factorMap.set(Gender.WOMENS, womensFactorMap);
    return factorMap;
} // createNfhsFactors

function createUSASIncrements() {
    const incMap = new Map();
    incMap.set(Stroke.Freestyle, 0.80);
    incMap.set(Stroke.Backstroke, 0.60);
    incMap.set(Stroke.Breaststroke, 1.00);
    incMap.set(Stroke.Butterfly, 0.70);
    incMap.set(Stroke.IndividualMedley, 0.80);
    return incMap;
} // createUSASIncrements

class Race {
    constructor(gender, course, stroke, distance, time = "00:00.00") {
        this.gender = gender;
        this.course = course;
        this.stroke = stroke;
        this.distance = distance;
        this.time = time;
    }

    static NFHS_FACTOR_MAP = createNfhsFactors();
    static USAS_INCRE_MAP = createUSASIncrements();

    isValid() {
        if (!this.gender || (this.gender !== Gender.MENS && this.gender !== Gender.WOMENS)) {
            alert("No gender specified");
            return false;
        }

        let seconds = timeInSeconds(this.time);
        if (isNaN(seconds)) {
            alert(`${this.time} is not a valid time representation, please enter as "MM:SS.HH"`);
            return false;
        }
        console.log(`${this.time} represents ${seconds} seconds`);
        console.log(`Course: ${this.course}; Stroke: ${this.stroke}; Distance: ${this.distance}`);
        switch (this.distance) {
            case 50:
                // Valid for all except Individual Medley
                if (this.stroke !== Stroke.IndividualMedley) {
                    return true;
                } else {
                    alert(`${this.eventDescription()} is not a valid event`);
                    return false;
                }
                break;
            case 200:
                // 200's are always valid races
                return true;
                break;
            case 100:
                // 100 IM is not valid in a long course pool
                if (this.course == Course.LCM && this.stroke == Stroke.IndividualMedley) {
                    alert(`${this.eventDescription()} is not a valid event`);
                    return false;
                } else {
                    return true;
                }
                break;
            case 400:
                // 400 is only valid for Individual Medeley, or else SCM/LCM freestyle
                if (this.stroke === Stroke.IndividualMedley || (this.course !== Course.SCY && this.stroke === Stroke.Freestyle)) {
                    return true;
                } else {
                    alert(`${this.eventDescription()} is not a valid event`);
                    return false;
                }
                break;
            case 800:
            case 1500:
                // These are only valid SCM/LCM freestyle events
                if (this.stroke === Stroke.Freestyle && (this.course != Course.SCY)) {
                    return true;
                } else {
                    alert(`${this.eventDescription()} is not a valid event`);
                    return false;                   
                }
            case 500:
            case 1000:
            case 1650:
                // These are only valid SCY freestyle events
                if (this.stroke === Stroke.Freestyle && this.course === Course.SCY) {
                    return true;
                } else {
                    alert(`${this.eventDescription()} is not a valid event`);
                    return false;
                }
                break;           
            default:
                alert(`${this.distance} is not a valid race distance`);
                return false;
        }
        return true;
    } // isValid

    resultValue() {
        return this.eventDescription() + " - " + this.time;
    }

    eventDescription() {
        return this.gender + " " + this.distance.toString() + this.course + " " + this.stroke;
    }

    shortCourseConversion(course) {
        if (course == Course.LCM || this.course == Course.LCM) {
            alert("Unexpected long course call");
            return undefined;
        }
        if (course == this.course) return this;

        const SHORT_COURSE_FACTOR = 1.11;
        const DISTANCE_FACTOR = 0.8925;
        const MILE_FACTOR = 1.02;
        let factor = undefined;
        let newDistance = this.distance;
        switch (this.distance) {
            case 50:
            case 100:
            case 200:
                factor = SHORT_COURSE_FACTOR;
                break;
            case 400:
                if (this.stroke == Stroke.Freestyle) {
                    newDistance = 500;
                    factor = DISTANCE_FACTOR;
                } else if (this.stroke == Stroke.IndividualMedley) {
                    factor = SHORT_COURSE_FACTOR;
                }
                break;
            case 800:
                newDistance = 1000;
                factor = DISTANCE_FACTOR;
                break;
            case 500:
                newDistance = 400;
                factor = DISTANCE_FACTOR;
                break;
            case 1000:
                newDistance = 800;
                factor = DISTANCE_FACTOR;
                break;
            case 1500:
                newDistance = 1650;
                factor = MILE_FACTOR;
                break;
            case 1650:
                newDistance = 1500
                factor = MILE_FACTOR;
                break;
            default:
                alert(`Invalid distance: ${this.distance}`);
                return undefined;
                break;
        } // switch
        let race = new Race(this.gender, this.course == Course.SCY ? Course.SCM : Course.SCY, this.stroke, newDistance);

        let seconds = timeInSeconds(this.time);
        let newSeconds = this.course == Course.SCM ? seconds / factor : seconds * factor;
        race.time = timeFromSeconds(newSeconds);
        console.log(`--- shortCourseConversion returning: ${race.resultValue()}`);
        return race;

    } // shortCourseConversion

    longAndShortConversion(course) {
        
        if (course == this.course) return this;
        if (course != Course.LCM && this.course != Course.LCM) {
            alert("Unexpected call");
            return undefined;
        }

        // 100 IM does not exist in long course
        if (this.stroke == Stroke.IndividualMedley && this.distance == 100 &&
            (this.course == Course.LCM || course == Course.LCM)) {
            alert(`${this.eventDescription()} is not a valid event`);
            return undefined;
        }

        // If we are converting *from* yards, switch to SCM first
        let race = this.course == Course.SCY ? this.shortCourseConversion(Course.SCM) : this;
        if (race == undefined) {
            return undefined;
        }
        console.log(`--- Converting ${race.resultValue()} to ${course}`);

        // Do meter conversion stuff
        let newRace = new Race(race.gender, race.course == Course.LCM ? Course.SCM : Course.LCM, race.stroke, race.distance);
        console.log(`--- Time: ${race.time}`);
        const seconds = timeInSeconds(race.time);
        console.log(`--- Seconds: ${seconds}`);
        const increment = Race.USAS_INCRE_MAP.get(race.stroke) * race.distance / 50;
        console.log(`--- Increment: ${increment}`);
        let newSeconds = race.course == Course.LCM ? seconds - increment : seconds + increment;
        console.log(`--- New Seconds: ${newSeconds}`);
        newRace.time = timeFromSeconds(newSeconds);
        console.log(`--- New Time: ${newRace.resultValue()}`);

        // If conversion was just meters, then we are done
        if (course != Course.SCY) return newRace;
        else return newRace.shortCourseConversion(course);

    } // longAndShortConversion

    convertUSAS(course) {
        if (!this.isValid()) return undefined;
        if (this.course == course) return this;
        return (this.course == Course.LCM || course == Course.LCM) ? this.longAndShortConversion(course) : this.shortCourseConversion(course);
    } // convertUSAS
    
    convertNFHS(course) {
        if (!this.isValid()) return undefined;
        if (this.course == Course.LCM || course == Course.LCM) {
            alert("NFHS does not have a conversion for long course meets");
            return undefined;
        }
        let factor  = Race.NFHS_FACTOR_MAP.get(this.gender).get(this.stroke).get(this.distance);
        if (factor == undefined) {
            alert(`${this.eventDescription()} is not a valid NFHS event`);
            return undefined;
        }
        if (this.course == course) return this;
        let race = new Race(this.gender, this.course == Course.SCY ? Course.SCM : Course.SCY, this.stroke, this.distance);
        if (race.distance == 500) race.distance = 400;
        else if(race.distance == 400) race.distance = 500;

        // If we are going from SCM to SCY, multiply, otherwise, divide
        let seconds = timeInSeconds(this.time);
        let newSeconds = this.course === Course.SCM ? seconds * factor : seconds / factor;
        race.time = timeFromSeconds(newSeconds);
        return race;

    } // convertNFHS

    convertNCAA(course) {
        if (!this.isValid()) return undefined;
        if (this.course == Course.LCM || course == Course.LCM) {
            alert("NCAA does not have a conversion for long course meets");
            return undefined;
        }
        if (course == this.course) return this;
        let factor = 0.906;
        let distance = this.distance;
        if (this.stroke == Stroke.Freestyle) {
            switch (this.distance) {
                case 400:
                    factor = 1.153;
                    distance = 500;
                    break;
                case 500:
                    factor = 1.153;
                    distance = 400;
                case 800:
                    factor = 1.153;
                    distance = 1000;
                case 1000:
                    factor = 1.153;
                    distance = 800;
                    break;
                case 1500:
                    factor = 1.013;
                    distance = 1650;
                    break;
                case 1650:
                    factor = 1.013;
                    distance = 1500;
                    break;
                default:
                    break;
            }
        } // freestyle

        let race = new Race(this.gender, course, this.stroke, distance);
        let seconds = timeInSeconds(this.time);
        let newSeconds = course == Course.SCY ? seconds * factor : seconds / factor;

        // NCAA conversion does not round to hundredths - so we need to drop the subsequent digits
        newSeconds = Math.floor(newSeconds * 100.0) / 100.0;
        race.time = timeFromSeconds(newSeconds);
        return race;

    } // convertNCAA

} // Race

function timeInSeconds(time) {
    let timeNum = Number(time.replace(":",""));
    console.log(`Converted ${time} to ${timeNum}`);
    if (timeNum == undefined || timeNum == NaN) return NaN;
    let seconds = (timeNum % 100) + (Math.floor(timeNum / 100) * 60);
    console.log(`Returning ${seconds} seconds`);
    return seconds;
}

function timeFromSeconds(time) {
    let remSeconds = time % 60.0;
    let minutes = (time - remSeconds) / 60.0;
    let seconds = Math.floor(remSeconds);
    let hundredths = Math.round((remSeconds - seconds) * 100.0);
    return String(minutes).padStart(2,'0') + ":" + String(seconds).padStart(2, '0') + "." + String(hundredths).padStart(2, '0');
}

function convertTest() {
    let raceY = new Race(Gender.MENS, Course.SCY, Stroke.Freestyle, 1650, "18:14.40");
    if (raceY.isValid()) {
        alert(raceY.resultValue());
    } else {
        alert("Invalid race object");
    }
    let raceM = raceY.convertNFHS(Course.SCM);
    if (!raceM || !raceM.isValid()) {
        alert("Failed NFHS race conversion");
    } else {
        alert(raceM.resultValue());
    }

    if (raceM) raceY = raceM.convertNFHS(Course.SCY);
    if (!raceY || !raceY.isValid()) {
        alert("Failed to convert back");
    } else {
        alert(raceY.resultValue());
    }

    let raceS = raceY.convertUSAS(Course.SCM);
    if (!raceS || !raceS.isValid()) {
        alert("SCM conversion failed");
    } else {
        alert(raceS.resultValue());
    }

    let raceL = raceS.convertUSAS(Course.LCM);
    if (!raceL || !raceL.isValid()) {
        alert("LCM conversion failed");
    } else {
        alert(raceL.resultValue());
    }

    raceY = raceL.convertUSAS(Course.SCY);
    if (!raceY || !raceY.isValid()) {
        alert("SCY Conversion failed");
    } else {
        alert(raceY.resultValue());
    }
} // convertTest

function processConversion() {
    var org = document.form.Forg.value;
    var gender = document.form.Fgender.value;
    var stroke = document.form.Fevent.value;
    var dist = Number(document.form.Fdistance.value);
    var inCourse = document.form.FinputCourse.value;
    var time = document.form.sourceTime.value;
    var outCourse = document.form.FoutputCourse.value;

    if (!org) {
        alert("ERROR: No organization specified");

    } else {
        let race = new Race(gender, inCourse, stroke, dist, time);
        if (race.isValid()) {
            let newRace = undefined;
            switch (org) {
                case Organization.NFHS:
                    newRace = race.convertNFHS(outCourse);
                    break;
                case Organization.USAS:
                    newRace = race.convertUSAS(outCourse);
                    break;
                case Organization.NCAA:
                    newRace = race.convertNCAA(outCourse);
                    break;
                default:
                    alert(`Invalid organization: ${org}`);
                    break;
            }
            if (newRace && newRace.isValid()) {
                let secs = timeInSeconds(race.time);
                document.form.sourceTime.value = timeFromSeconds(secs);
                document.form.destStroke.value = newRace.stroke;
                document.form.destDistance.value = newRace.distance;
                document.form.destTime.value = newRace.time;
            } else {
                document.form.destStroke.value = "";
                document.form.destDistance.value = "";
                document.form.destTime.value = "";
            }
        } else {
            document.form.destStroke.value = "";
            document.form.destDistance.value = "";
            document.form.destTime.value = "";
        }
    }
}

//export {timeInSeconds, timeFromSeconds, Race, Gender, Organization, Stroke, Course};
