/* Copyright 2010-2011 Ilkka Halila
This file is part of Goblin Camp.

Goblin Camp is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Goblin Camp is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License 
along with Goblin Camp. If not, see <http://www.gnu.org/licenses/>.*/

import { Item } from "./Item.js"
import { Job } from "./Job.js"
import { Serializable } from "./data/Serialization.js"

export class JobManagerClass extends Serializable {
    static CLASS_VERSION = 1;

    /** @type {Array<Job>} */
    availableList = new Array(JobPriority.JobPrority.PRIORITY_COUNT);
    /** @type {Array<Job>} */
    waitingList = [];
    /** @type {Array<number>} */
    menialNPCsWaiting = []
        /** @type {Array<number>} */
    expertNPCsWaiting = [];
    /** @type {Array<Array<Job>>} */
    toolJobs = [];
    /** @type {Array<Job>} */
    failList = [];

    static Reset() {
        delete JobManager;
        JobManager = new JobManagerClass();
    }

    constructor() {
        for (let i of Item.Categories) {
            this.toolJobs.push([]);
        }
    }
    AddJob(newJob) {
        if (!newJob.Attempt() || newJob.OutsideTerritory() || newJob.InvalidFireAllowance()) {
            this.failList.push(newJob);
            return;
        }

        if (newJob.PreReqsCompleted()) {
            this.availableList[newJob.priority()].push(newJob);
            return;
        } else {
            newJob.Paused(true);
            this.waitingList.push(newJob);
        }
    }
    Draw(pos, from = 0, width = 40, height = 40, the_console = TCODConsole.root) {
        let skip = 0;
        let y = pos.Y();
        let npc;
        let color_mappings = [Color.green, new Color(0, 160, 60), new Color(175, 150, 50), new Color(165, 95, 0), Color.grey];

        for (let i = 0; i <= JobPriority.JobPrority.PRIORITY_COUNT; i++) {
            the_console.setDefaultForeground(color_mappings[i]);
            for (let jobi of(i < JobPriority.JobPrority.PRIORITY_COUNT ? this.availableList[i] : this.waitingList)) {
                if (skip < from) {
                    ++skip;
                    continue;
                }

                npc = Game.GetNPC(jobi.Assigned());
                if (npc) {
                    the_console.print(pos.X(), y, "%c", npc.GetNPCSymbol());
                }
                the_console.print(pos.X() + 2, y, "%s", jobi.name);

                if (DEBUG) {
                    if (npc) {
                        if (npc.currentTask() != 0) {
                            the_console.print(pos.X() + 45, y, "%s", jobi.ActionToString(npc.currentTask().action));
                        }
                    }
                    the_console.print(pos.X() + width - 11, y, "A. %d", jobi.Assigned());
                }
                if (++y - pos.Y() >= height) {
                    the_console.setDefaultForeground(Color.white);
                    return;
                }

            }
        }
        the_console.setDefaultForeground(Color.white);
    }
    CancelJob(oldJob, msg, result) {
        let job;
        if (!(job = oldJob.lock())) return;

        job.Assign(-1);
        job.Paused(true);

        //Push job onto waiting list
        this.waitingList.push(job);

        //Remove job from availabe list
        for (let jobi of this.availableList[job.priority()]) {
            if (jobi == job) {
                this.availableList[job.priority()].splice(this.availableList[job.priority()].indexOf(jobi), 1);
                break;
            }
        }

        //If the job requires a tool, remove it from the toolJobs list
        if (job.RequiresTool()) {
            for (let jobi of this.toolJobs[job.GetRequiredTool()]) {
                if (jobi.lock() == job) {
                    this.toolJobs[job.GetRequiredTool()].erase(jobi);
                    break;
                }
            }
        }
    }
    GetJob(uid) {
        let job;

        outer:
            for (let i = 0; i < JobPriority.JobPrority.PRIORITY_COUNT; ++i) {
                for (let jobi of this.availableList[i]) {
                    let npc = Game.GetNPC(uid);
                    if (npc && jobi.Menial() != npc.Expert()) {
                        if (jobi.Assigned() == -1 && !jobi.Removable()) {
                            job = jobi;
                            //goto FoundJob;
                            break outer;
                        }
                    }
                }
            }

        FoundJob:
            if (job.lock()) job.lock().Assign(uid);

        return job;
    }
    GetJobByListIndex(index) {
        let count = 0;

        for (let i = 0; i < JobPriority.JobPrority.PRIORITY_COUNT; ++i) {
            for (let jobi of this.availableList[i]) {
                if (count++ == index) return jobi;
            }
        }

        for (let waitingIter of this.waitingList) {
            if (count++ == index) return waitingIter;
        }

        return null;
    }
    JobAmount() {
        let count = 0;
        for (let i = 0; i < JobPriority.JobPrority.PRIORITY_COUNT; ++i) {
            count += this.availableList[i].length;
        }
        count += this.waitingList.length;
        return count;
    }
    ClearWaitingNpcs() {
        this.expertNPCsWaiting = [];
        this.menialNPCsWaiting = [];
    }
    NPCWaiting(uid) {
        let npc = Game.GetNPC(uid);
        if (!npc) return;
        if (npc.Expert()) {
            for (let it of this.expertNPCsWaiting) {
                if (it == uid) {
                    return;
                }
            }
            this.expertNPCsWaiting.push(uid);
        } else {
            for (let it of this.menialNPCsWaiting) {
                if (it == uid) {
                    return;
                }
            }
            this.menialNPCsWaiting.push(uid);
        }

    }

    NPCNotWaiting(uid) {
        let npc = Game.GetNPC(uid);
        if (!npc) return;
        if (npc.Expert()) {
            for (let it of this.expertNPCsWaiting) {
                if (it == uid) {
                    this.expertNPCsWaiting.splice(this.expertNPCsWaiting.indexOf(it), 1);
                    return;
                }
            }
        } else {
            for (let it of this.menialNPCsWaiting) {
                if (it == uid) {
                    this.menialNPCsWaiting.splice(this.expertNPCsWaiting.indexOf(it), 1);
                    return;
                }
            }
        }

    }
    Update() {
        //Check the waiting list for jobs that have completed prerequisites, and move them to the
        //job queue if so, remove removables, and retry retryables, remove unpauseds

        /** @type {Job} jobIter */
        let jobIter;
        for (jobIter of this.waitingList) {

            if (jobIter.Removable()) {
                jobIter = this.waitingList.splice(this.waitingList.indexOf(jobIter), 1);
                continue;
            }

            if (!(jobIter).PreReqs().empty() && (jobIter).PreReqsCompleted()) {
                (jobIter).Paused(false);
            }

            if (!(jobIter).Paused()) {
                this.AddJob(jobIter);
                jobIter = this.waitingList.splice(this.waitingList.indexOf(jobIter), 1);
            } else {
                if (!(jobIter).Parent().lock() && (jobIter).PreReqs().length) {
                    //Job has unfinished prereqs, itsn't removable and is NOT a prereq itself
                    for (let pri of(jobIter).PreReqs()) {
                        if (pri.lock()) {
                            pri.lock().Paused(false);
                        }
                    }
                } else if (!(jobIter).Parent().lock()) {
                    (jobIter).Paused(false);
                }
                // ++jobIter;
            }

        }

        //Check the normal queues for jobs that have all prerequisites and parents completed and
        //remove them
        for (let i = 0; i < JobPriority.JobPrority.PRIORITY_COUNT; ++i) {
            for (let jobi of this.availableList[i]) {
                if ((jobi).Completed() && (jobi).PreReqsCompleted()) {
                    jobi = this.availableList[i].splice(this.availableList.indexOf(jobi));
                } else {
                    ++jobi;
                }
            }
        }

        //Check tool jobs, remove them if they no longer point to existing jobs
        for (let i = 0; i < Item.Categories.length; ++i) {
            for (let jobi of this.toolJobs[i]) {
                if (!jobi.lock()) jobi = this.toolJobs[i].splice(this.toolJobs[i].indexOf(jobi), 1);
                else ++jobi;
            }
        }

        while (this.failList.length) {
            this.failList[0].Fail();
            this.failList.shift();
        }
    }
    AssignJobs() {
        //It's useless to attempt to assing more tool-required jobs than there are tools 
        let maxToolJobs = Item.Categories.length;
        for (let i = 0; i < Item.Categories.length; ++i) {
            maxToolJobs[i] = StockManager.CategoryQuantity(new ItemCategory(i)) - this.toolJobs[i].length;
        }

        for (let i = 0; i < JobPriority.JobPrority.PRIORITY_COUNT && (this.expertNPCsWaiting.length || this.menialNPCsWaiting.length); i++) {
            if (!this.availableList[i].length) continue;

            let menialJobsToAssign = [];
            let expertJobsToAssign = [];
            for (let jobi of this.availableList[i]) {
                if ((jobi).Assigned() == -1 && !(jobi).Removable()) {
                    /*Limit assigning jobs to 20 at a time, large matrix sizes cause considerable slowdowns.
                    Also, if the job requires a tool only add it to assignables if there are potentially enough
                    tools for each job*/
                    if (!(jobi).RequiresTool() ||
                        ((jobi).RequiresTool() && maxToolJobs[(jobi).GetRequiredTool()] > 0)) {
                        if ((jobi).RequiresTool()) --maxToolJobs[(jobi).GetRequiredTool()];
                        if ((jobi).Menial() && menialJobsToAssign.length < 20) menialJobsToAssign.push(jobi);
                        else if (!(jobi).Menial() && expertJobsToAssign.length < 20) expertJobsToAssign.push(jobi);
                    }
                }
            }
            if (!(menialJobsToAssign.length || expertJobsToAssign.length)) continue;

            let menialMatrixSize = Math.max(menialJobsToAssign.length, menialNPCsWaiting.length);
            let expertMatrixSize = Math.max(expertJobsToAssign.length, expertNPCsWaiting.length);
            /** @type {boost.numeric.ublas.matrix} */
            let menialMatrix = new matrix(menialMatrixSize, menialMatrixSize);
            /** @type {boost.numeric.ublas.matrix} */
            let expertMatrix = new matrix(expertMatrixSize, expertMatrixSize);

            for (let x = 0; x < menialMatrixSize; x++) {
                for (let y = 0; y < menialMatrixSize; y++) {
                    if (x >= this.menialNPCsWaiting.length || y >= menialJobsToAssign.length) {
                        menialMatrix[x][y] = 1;
                        continue;
                    }

                    let job = menialJobsToAssign[y];
                    let npc = Game.GetNPC(this.menialNPCsWaiting[x]);
                    if (!npc || !job.tasks.length ||
                        (job.tasks[0].target.X() == 0 && job.tasks[0].target.Y() == 0)) {
                        menialMatrix[x][y] = 1;
                    } else if (npc) {
                        menialMatrix[x][y] = 10000 - Coordinate.Distance(job.tasks[0].target, npc.Position());
                    }
                    if (npc && job.RequiresTool()) {
                        if (!npc.Wielding().lock() || !npc.Wielding().lock().IsCategory(job.GetRequiredTool())) {
                            menialMatrix[x][y] -= 2000;
                        }
                    }

                }
            }

            for (let x = 0; x < expertMatrixSize; x++) {
                for (let y = 0; y < expertMatrixSize; y++) {
                    if (x >= this.expertNPCsWaiting.length || y >= expertJobsToAssign.length) {
                        expertMatrix[x][y] = 1;
                    } else {
                        let job = expertJobsToAssign[y];
                        let npc = Game.GetNPC(this.expertNPCsWaiting[x]);
                        if (!npc || job.tasks.empty() ||
                            (job.tasks[0].target.X() == 0 && job.tasks[0].target.Y() == 0)) {
                            expertMatrix[x][y] = 1;
                        } else {
                            expertMatrix[x][y] = 10000 - Coordinate.Distance(job.tasks[0].target, npc.Position());
                        }
                        if (npc && job.RequiresTool()) {
                            if (!npc.Wielding().lock() || !npc.Wielding().lock().IsCategory(job.GetRequiredTool())) {
                                expertMatrix[x][y] -= 2000;
                            }
                        }
                    }
                }
            }
            let menialAssignments = FindBestMatching(menialMatrix);
            let expertAssignments = FindBestMatching(expertMatrix);

            for (let i = 0, n = 0; n < this.menialNPCsWaiting.length; i++, n++) {
                let jobNum = menialAssignments[i];
                if (jobNum < menialJobsToAssign.length) {
                    let npcNum = this.menialNPCsWaiting[n];
                    let job = menialJobsToAssign[jobNum];
                    let npc = Game.GetNPC(npcNum);
                    if (job && npc) {
                        job.Assign(npcNum);
                        this.menialNPCsWaiting.splice(n, 1);
                        n--;
                        if (job.RequiresTool())
                            this.toolJobs[job.GetRequiredTool()].push(job);
                        npc.StartJob(job);
                    }
                }
            }

            for (let i = 0, n = 0; n < this.expertNPCsWaiting.length; i++, n++) {
                let jobNum = expertAssignments[i];
                if (jobNum < expertJobsToAssign.length) {
                    let npcNum = this.expertNPCsWaiting[n];
                    let job = expertJobsToAssign[jobNum];
                    let npc = Game.GetNPC(npcNum);
                    if (job && npc) {
                        job.Assign(npcNum);
                        this.expertNPCsWaiting.splice(n, 1);
                        n--;
                        if (job.RequiresTool())
                            this.toolJobs[job.GetRequiredTool()].push(job);
                        npc.StartJob(job);
                    }
                }
            }
        }
    }
    RemoveJob(...args) {
        if (args[0] instanceof Job)
            this.RemoveJobByJob(args[0]);
        else if (args[0] instanceof Action && args[1] instanceof Coordinate)
            this.RemoveJobByActionAndCoordinate(args[0], args[1]);
    }

    /**
     * 
     * @param {Job} wjob 
     */
    RemoveJobByJob(wjob) {
        let job;
        if (!(job = wjob.lock())) return;
        for (let i = 0; i < JobPriority.JobPrority.PRIORITY_COUNT; ++i) {
            for (let jobi of this.availableList[i]) {
                if (jobi == job) {
                    jobi = this.availableList[i].splice(this.availableList[i].indexOf(jobi), 1);
                    return;
                }
            }
        }
        for (let jobi of this.waitingList) {
            if (jobi == job) {
                jobi = this.waitingList.splice(this.waitingList.indexOf(jobi));
                return;
            }
        }
    }

    /**
     * Can remove more than was intended, use with caution
     * 
     * @param {Action} action
     * @param {Coordinate} location
     */
    RemoveJobByActionAndCoordinate(action, location) {
        for (let i = 0; i <= JobPrority.PRIORITY_COUNT; ++i) {
            for (let jobi of(i < JobPrority.PRIORITY_COUNT ? this.availableList[i] : this.waitingList)) {
                let remove = false;
                for (let taski of(jobi).tasks) {
                    if (taski.action == action && taski.target == location) {
                        remove = true;
                        break;
                    }
                }
                if (remove) {
                    (jobi).Attempts(0);
                    if ((jobi).Assigned() >= 0) {
                        let npc = Game.GetNPC((jobi).Assigned());
                        let jobToRemove = jobi;
                        ++jobi; //AbortJob will cancel the job and the invalidate the old iterator
                        if (npc) npc.AbortJob(jobToRemove);
                    } else {
                        jobi = (i < JobPrority.PRIORITY_COUNT) ?
                            this.availableList[i].splice(this.availableList[i].indexOf(jobi), -1) :
                            this.waitingList.splice(this.waitingList.indexOf(jobi), 1);
                    }
                } else {
                    ++jobi;
                }
            }
        }
    }
    serialize(ar, version) {
        return {
            availableList: ar.serialize(this.availableList),
            waitingList: ar.serialize(this.waitingList),
            menialNPCsWaiting: ar.serialize(this.menialNPCsWaiting),
            expertNPCsWaiting: ar.serialize(this.expertNPCsWaiting),
            toolJobs: ar.serialize(this.toolJobs),
            failList: ar.serialize(this.failList)
        };
    }
    static deserialize(data, version, deserializer) {
        let result = new JobManagerClass();
        result.availableList = deserializer.deserialize(data.availableList);
        result.waitingList = deserializer.deserialize(data.waitingList);
        result.menialNPCsWaiting = deserializer.deserialize(data.menialNPCsWaiting);
        result.expertNPCsWaiting = deserializer.deserialize(data.expertNPCsWaiting);
        result.toolJobs = deserializer.deserialize(data.toolJobs);
        result.failList = deserializer.deserialize(data.failList);
        return result;
    }
}
export let JobManager = new JobManagerClass();