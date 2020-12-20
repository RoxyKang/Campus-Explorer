"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Scheduler {
    constructor() {
        this.allTimeSlot = [
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
    }
    schedule(sections, rooms) {
        let res = [];
        let scheduledRooms = [];
        let roomTimeSlot = {};
        let courseTimeSlot = {};
        sections.sort((a, b) => {
            return this.sort(a, b);
        }).reverse();
        for (const room of rooms) {
            roomTimeSlot[room.rooms_shortname.concat("_" + room.rooms_number)] = this.allTimeSlot.slice();
        }
        for (const section of sections) {
            let courseNumber = section.courses_dept.concat(section.courses_id);
            if (courseTimeSlot.hasOwnProperty(courseNumber)) {
                continue;
            }
            courseTimeSlot[courseNumber] = this.allTimeSlot.slice();
        }
        for (const item of sections) {
            let validRooms = [];
            this.findValidRooms(rooms, roomTimeSlot, courseTimeSlot, item, validRooms);
            if (validRooms.length === 0) {
                continue;
            }
            let minDRoom = this.findMinDRoom(validRooms, scheduledRooms, Infinity);
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
    findMinDRoom(validRooms, scheduledRooms, minDist) {
        let minDRoom;
        for (const validRm of validRooms) {
            let maxDist = -1;
            for (const room of scheduledRooms) {
                let dist = this.calculateDist(room, validRm);
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
    findValidRooms(rooms, roomTimeSlot, courseTimeSlot, item, validRooms) {
        for (const room of rooms) {
            let roomTS = roomTimeSlot[room.rooms_shortname.concat("_" + room.rooms_number)];
            let courseTS = courseTimeSlot[item.courses_dept.concat(item.courses_id)];
            let hasCommonTS = roomTS.some((elem) => courseTS.includes(elem));
            if (!hasCommonTS) {
                continue;
            }
            let roomSize = room.rooms_seats;
            if (roomSize >= (item.courses_audit + item.courses_fail + item.courses_pass)) {
                validRooms.push(room);
            }
        }
    }
    calculateDist(room0, room1) {
        let R = 6371e3;
        let lat0 = (room0.rooms_lat * Math.PI) / 180;
        let lat1 = (room1.rooms_lat * Math.PI) / 180;
        let deltaLat = ((room1.rooms_lat - room0.rooms_lat) * Math.PI) / 180;
        let deltaLon = ((room1.rooms_lon - room0.rooms_lon) * Math.PI) / 180;
        let a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat0) *
                Math.cos(lat1) *
                Math.sin(deltaLon / 2) *
                Math.sin(deltaLon / 2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let d = R * c;
        return d / 1372;
    }
    updateRoomTimeSlot(roomTimeSlot, roomName, room) {
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
    updateCourseTimeSlot(courseTimeSlot, section, scheduledTime) {
        let courseName = section.courses_dept.concat(section.courses_id);
        let courseTS = courseTimeSlot[courseName];
        let index = courseTS.indexOf(scheduledTime);
        courseTS.splice(index, 1);
    }
    sort(a, b) {
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
exports.default = Scheduler;
//# sourceMappingURL=Scheduler.js.map