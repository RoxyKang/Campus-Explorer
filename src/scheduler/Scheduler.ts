import { IScheduler, SchedRoom, SchedSection, TimeSlot } from "./IScheduler";
import Util from "../Util";

export default class Scheduler implements IScheduler {
    public allTimeSlot = [
        "MWF 0800-0900",
        "MWF 0900-1000",
        "MWF 1000-1100",
        "MWF 1100-1200",
        "MWF 1200-1300",
        "MWF 1300-1400",
        "MWF 1400-1500",
        "MWF 1500-1600",
        "MWF 1600-1700",
        "TR  0800-0930",
        "TR  0930-1100",
        "TR  1100-1230",
        "TR  1230-1400",
        "TR  1400-1530",
        "TR  1530-1700",
    ];

    public schedule(sections: SchedSection[], rooms: SchedRoom[]): Array<[SchedRoom, SchedSection, TimeSlot]> {
        let res: Array<[SchedRoom, SchedSection, TimeSlot]> = [];
        let scheduledRooms: SchedRoom[] = [];
        let roomTimeSlot: { [key: string]: any[] } = {};
        let courseTimeSlot: { [key: string]: any[]} = {};

        sections.sort((a, b) => {
            return this.sort(a, b); // Enrolment descending sort
        }).reverse();

        for (const room of rooms) {
            roomTimeSlot[room.rooms_shortname.concat("_" + room.rooms_number)] = this.allTimeSlot.slice();
        }

        for (const section of sections) {
            let courseNumber: string = section.courses_dept.concat(section.courses_id);
            if (courseTimeSlot.hasOwnProperty(courseNumber)) {
                continue;
            }
            courseTimeSlot[courseNumber] = this.allTimeSlot.slice();
        }

        for (const item of sections) {
            let validRooms: SchedRoom[] = []; // The room is valid as long as its size is larger than enrolled student
            this.findValidRooms(rooms, roomTimeSlot, courseTimeSlot, item, validRooms);
            if (validRooms.length === 0) {
                continue;
            }
            let minDRoom: SchedRoom = this.findMinDRoom(validRooms, scheduledRooms, Infinity);
            // scheduled room for the current section is decided
            scheduledRooms.push(minDRoom);
            let scheduledT = roomTimeSlot[minDRoom.rooms_shortname.concat("_" + minDRoom.rooms_number)][0];
            res.push([minDRoom, item, scheduledT]);

            this.updateRoomTimeSlot(roomTimeSlot, minDRoom.rooms_shortname.concat("_" + minDRoom.rooms_number), rooms);
            this.updateCourseTimeSlot(courseTimeSlot, item, scheduledT);

            if (Object.keys(roomTimeSlot).length === 0) {
                break;
            }
        }
        return res;
    }

    private findMinDRoom(validRooms: SchedRoom[], scheduledRooms: SchedRoom[], minDist: number): SchedRoom {
        let minDRoom: SchedRoom;
        for (const validRm of validRooms) {
            let maxDist = -1;
            for (const room of scheduledRooms) {
                let dist: number = this.calculateDist(room, validRm);
                if (dist > maxDist) {
                    maxDist = dist;
                }
            }
            if (maxDist < minDist) {
                minDist = maxDist;
                minDRoom = validRm;
            }
        }
        return minDRoom;
    }

    private findValidRooms(
        rooms: SchedRoom[],
        roomTimeSlot: { [key: string]: any[] },
        courseTimeSlot: { [key: string]: any[] },
        item: SchedSection,
        validRooms: SchedRoom[]) {
        for (const room of rooms) {
            let roomTS: any [] = roomTimeSlot[room.rooms_shortname.concat("_" + room.rooms_number)];
            let courseTS: any[] = courseTimeSlot[item.courses_dept.concat(item.courses_id)];
            let hasCommonTS: boolean = roomTS.some((elem) => courseTS.includes(elem));
            if (!hasCommonTS) {
                continue;
            }

            let roomSize = room.rooms_seats;
            if (roomSize >= (item.courses_audit + item.courses_fail + item.courses_pass)) {
                validRooms.push(room);
            }
        }
    }

// https://www.movable-type.co.uk/scripts/latlong.html
    private calculateDist(room0: SchedRoom, room1: SchedRoom): number {
        let R = 6371e3;
        let lat0 = (room0.rooms_lat * Math.PI) / 180;
        let lat1 = (room1.rooms_lat * Math.PI) / 180;
        let deltaLat = ((room1.rooms_lat - room0.rooms_lat) * Math.PI) / 180;
        let deltaLon = ((room1.rooms_lon - room0.rooms_lon) * Math.PI) / 180;

        let a =
            Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat0) *
                Math.cos(lat1) *
                Math.sin(deltaLon / 2) *
                Math.sin(deltaLon / 2);

        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let d = R * c;

        return d / 1372;
    }

    private updateRoomTimeSlot(roomTimeSlot: { [key: string]: any[] }, roomName: string, room: SchedRoom[]) {
        roomTimeSlot[roomName].shift();
        if (roomTimeSlot[roomName].length === 0) {
            for (const item of room) {
                if (item.rooms_shortname.concat("_" + item.rooms_number) === roomName) {
                    let index = room.indexOf(item);
                    room.splice(index, 1);
                }
            }
        }
    }

    private updateCourseTimeSlot(
        courseTimeSlot: { [key: string]: any[] },
        section: SchedSection,
        scheduledTime: string) {
        let courseName = section.courses_dept.concat(section.courses_id);
        let courseTS = courseTimeSlot[courseName];
        let index = courseTS.indexOf(scheduledTime);
        courseTS.splice(index, 1);
    }

    private sort(a: any, b: any): number {
        let aEnrol = a.courses_pass + a.courses_fail + a.courses_audit;
        let bEnrol = b.courses_pass + b.courses_fail + b.courses_audit;
        if (aEnrol < bEnrol) {
            return -1;
        }
        if (aEnrol > bEnrol) {
            return 1;
        }
        return 0;
    }
}

// let testSections = [
//     {
//         courses_dept: "cpsc",
//         courses_id: "340",
//         courses_uuid: "1319",
//         courses_pass: 101,
//         courses_fail: 7,
//         courses_audit: 2
//     },
//     {
//         courses_dept: "cpsc",
//         courses_id: "340",
//         courses_uuid: "3397",
//         courses_pass: 171,
//         courses_fail: 3,
//         courses_audit: 1
//     },
//     {
//         courses_dept: "cpsc",
//         courses_id: "344",
//         courses_uuid: "62413",
//         courses_pass: 93,
//         courses_fail: 2,
//         courses_audit: 0
//     },
//     {
//         courses_dept: "cpsc",
//         courses_id: "344",
//         courses_uuid: "72385",
//         courses_pass: 43,
//         courses_fail: 1,
//         courses_audit: 0
//     }
// ];
//
// let testRooms = [
//     {
//         rooms_shortname: "AERL",
//         rooms_number: "120",
//         rooms_seats: 144,
//         rooms_lat: 49.26372,
//         rooms_lon: -123.25099
//     },
//     {
//         rooms_shortname: "ALRD",
//         rooms_number: "105",
//         rooms_seats: 94,
//         rooms_lat: 49.2699,
//         rooms_lon: -123.25318
//     },
//     {
//         rooms_shortname: "ANGU",
//         rooms_number: "098",
//         rooms_seats: 260,
//         rooms_lat: 49.26486,
//         rooms_lon: -123.25364
//     },
//     {
//         rooms_shortname: "BUCH",
//         rooms_number: "A101",
//         rooms_seats: 275,
//         rooms_lat: 49.26826,
//         rooms_lon: -123.25468
//     }
// ];
// let s = new Scheduler();
// let result = s.schedule(testSections, testRooms);
// Util.trace(result);
