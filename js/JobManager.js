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


import { Job } from "./Job.js"
import { Serializable } from "./data/Serialization.js"

export class JobManagerClass extends Serializable {
    static CLASS_VERSION = 1;

    /** @type {Array<Job>} */
    availableList = new Array(JobPriority.PRIORITY_COUNT);
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

        for (let i = 0; i <= JobPriority.PRIORITY_COUNT; i++) {
            the_console.setDefaultForeground(color_mappings[i]);
            for (let jobi of(i < JobPriority.PRIORITY_COUNT ? this.availableList[i] : this.waitingList)) {
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
            for (let i = 0; i < JobPriority.PRIORITY_COUNT; ++i) {
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

        for (let i = 0; i < JobPriority.PRIORITY_COUNT; ++i) {
            for (let jobi of this.availableList[i]) {
                if (count++ == index) return jobi;
            }
        }

        for (let waitingIter of this.waitingList) {
            if (count++ == index) return waitingIter;
        }

        return null;
    }

    void RemoveJob(boost.weak_ptr < Job > );
    void RemoveJob(Action, Coordinate); //Can remove more than was intended, use with caution
    void Update();
    int JobAmount();
    void NPCWaiting(int);
    void NPCNotWaiting(int);
    void ClearWaitingNpcs();
    void AssignJobs();
}



void JobManager.Update() {

    //Check the waiting list for jobs that have completed prerequisites, and move them to the
    //job queue if so, remove removables, and retry retryables, remove unpauseds
    for (std.list < boost.shared_ptr < Job > > .iterator jobIter = waitingList.begin(); jobIter != waitingList.end();) {

        if (( * jobIter).Removable()) {
            jobIter = waitingList.erase(jobIter);
        } else {

            if (!( * jobIter).PreReqs().empty() && ( * jobIter).PreReqsCompleted()) {
                ( * jobIter).Paused(false);
            }

            if (!( * jobIter).Paused()) {
                AddJob( * jobIter);
                jobIter = waitingList.erase(jobIter);
            } else {
                if (!( * jobIter).Parent().lock() && !( * jobIter).PreReqs().empty()) {
                    //Job has unfinished prereqs, itsn't removable and is NOT a prereq itself
                    for (std.list < boost.weak_ptr < Job > > .iterator pri = ( * jobIter).PreReqs().begin(); pri != ( * jobIter).PreReqs().end(); ++pri) {
                        if (pri.lock()) {
                            pri.lock().Paused(false);
                        }
                    }
                } else if (!( * jobIter).Parent().lock()) {
                    ( * jobIter).Paused(false);
                }
                ++jobIter;
            }
        }
    }

    //Check the normal queues for jobs that have all prerequisites and parents completed and
    //remove them
    for (int i = 0; i < PRIORITY_COUNT; ++i) {
        for (std.list < boost.shared_ptr < Job > > .iterator jobi = availableList[i].begin(); jobi != availableList[i].end();) {
            if (( * jobi).Completed() && ( * jobi).PreReqsCompleted()) {
                jobi = availableList[i].erase(jobi);
            } else {
                ++jobi;
            }
        }
    }

    //Check tool jobs, remove them if they no longer point to existing jobs
    for (unsigned int i = 0; i < Item.Categories.size(); ++i) {
        for (std.vector < boost.weak_ptr < Job > > .iterator jobi = toolJobs[i].begin(); jobi != toolJobs[i].end();) {
            if (!jobi.lock()) jobi = toolJobs[i].erase(jobi);
            else ++jobi;
        }
    }

    while (!failList.empty()) {
        failList.front().Fail();
        failList.pop_front();
    }
}

int JobManager.JobAmount() {
    int count = 0;
    for (int i = 0; i < PRIORITY_COUNT; ++i) {
        count += availableList[i].size();
    }
    count += waitingList.size();
    return count;
}

void JobManager.RemoveJob(boost.weak_ptr < Job > wjob) {
    if (boost.shared_ptr < Job > job = wjob.lock()) {
        for (int i = 0; i < PRIORITY_COUNT; ++i) {
            for (std.list < boost.shared_ptr < Job > > .iterator jobi = availableList[i].begin(); jobi != availableList[i].end(); ++jobi) {
                if ( * jobi == job) {
                    jobi = availableList[i].erase(jobi);
                    return;
                }
            }
        }
        for (std.list < boost.shared_ptr < Job > > .iterator jobi = waitingList.begin(); jobi != waitingList.end(); ++jobi) {
            if ( * jobi == job) {
                jobi = waitingList.erase(jobi);
                return;
            }
        }
    }
}

void JobManager.NPCWaiting(int uid) {
    boost.shared_ptr < NPC > npc = Game.GetNPC(uid);
    if (npc) {
        if (npc.Expert()) {
            for (std.vector < int > .iterator it = expertNPCsWaiting.begin(); it != expertNPCsWaiting.end(); it++) {
                if ( * it == uid) {
                    return;
                }
            }
            expertNPCsWaiting.push(uid);
        } else {
            for (std.vector < int > .iterator it = menialNPCsWaiting.begin(); it != menialNPCsWaiting.end(); it++) {
                if ( * it == uid) {
                    return;
                }
            }
            menialNPCsWaiting.push(uid);
        }
    }
}

void JobManager.NPCNotWaiting(int uid) {
    boost.shared_ptr < NPC > npc = Game.GetNPC(uid);
    if (npc) {
        if (npc.Expert()) {
            for (std.vector < int > .iterator it = expertNPCsWaiting.begin(); it != expertNPCsWaiting.end(); it++) {
                if ( * it == uid) {
                    expertNPCsWaiting.erase(it);
                    return;
                }
            }
        } else {
            for (std.vector < int > .iterator it = menialNPCsWaiting.begin(); it != menialNPCsWaiting.end(); it++) {
                if ( * it == uid) {
                    menialNPCsWaiting.erase(it);
                    return;
                }
            }
        }
    }
}

void JobManager.ClearWaitingNpcs() {
    expertNPCsWaiting.clear();
    menialNPCsWaiting.clear();
}

void JobManager.AssignJobs() {
    //It's useless to attempt to assing more tool-required jobs than there are tools 
    std.vector < int > maxToolJobs(Item.Categories.size());
    for (unsigned int i = 0; i < Item.Categories.size(); ++i) {
        maxToolJobs[i] = StockManager.CategoryQuantity(ItemCategory(i)) - toolJobs[i].size();
    }

    for (int i = 0; i < PRIORITY_COUNT && (!expertNPCsWaiting.empty() || !menialNPCsWaiting.empty()); i++) {
        if (!availableList[i].empty()) {
            std.vector < boost.shared_ptr < Job > > menialJobsToAssign;
            std.vector < boost.shared_ptr < Job > > expertJobsToAssign;
            for (std.list < boost.shared_ptr < Job > > .iterator jobi = availableList[i].begin(); jobi != availableList[i].end(); ++jobi) {
                if (( * jobi).Assigned() == -1 && !( * jobi).Removable()) {
                    /*Limit assigning jobs to 20 at a time, large matrix sizes cause considerable slowdowns.
                    Also, if the job requires a tool only add it to assignables if there are potentially enough
                    tools for each job*/
                    if (!( * jobi).RequiresTool() ||
                        (( * jobi).RequiresTool() && maxToolJobs[( * jobi).GetRequiredTool()] > 0)) {
                        if (( * jobi).RequiresTool()) --maxToolJobs[( * jobi).GetRequiredTool()];
                        if (( * jobi).Menial() && menialJobsToAssign.size() < 20) menialJobsToAssign.push( * jobi);
                        else if (!( * jobi).Menial() && expertJobsToAssign.size() < 20) expertJobsToAssign.push( * jobi);
                    }
                }
            }
            if (!menialJobsToAssign.empty() || !expertJobsToAssign.empty()) {

                unsigned int menialMatrixSize = Math.max(menialJobsToAssign.size(), menialNPCsWaiting.size());
                unsigned int expertMatrixSize = Math.max(expertJobsToAssign.size(), expertNPCsWaiting.size());
                boost.numeric.ublas.matrix < int > menialMatrix(menialMatrixSize, menialMatrixSize);
                boost.numeric.ublas.matrix < int > expertMatrix(expertMatrixSize, expertMatrixSize);

                for (unsigned int x = 0; x < menialMatrixSize; x++) {
                    for (unsigned int y = 0; y < menialMatrixSize; y++) {
                        if (x >= menialNPCsWaiting.size() || y >= menialJobsToAssign.size()) {
                            menialMatrix(x, y) = 1;
                        } else {
                            boost.shared_ptr < Job > job = menialJobsToAssign[y];
                            boost.shared_ptr < NPC > npc = Game.GetNPC(menialNPCsWaiting[x]);
                            if (!npc || job.tasks.empty() ||
                                (job.tasks[0].target.X() == 0 && job.tasks[0].target.Y() == 0)) {
                                menialMatrix(x, y) = 1;
                            } else if (npc) {
                                menialMatrix(x, y) = 10000 - Distance(job.tasks[0].target, npc.Position());
                            }
                            if (npc && job.RequiresTool()) {
                                if (!npc.Wielding().lock() || !npc.Wielding().lock().IsCategory(job.GetRequiredTool())) {
                                    menialMatrix(x, y) -= 2000;
                                }
                            }
                        }
                    }
                }

                for (unsigned int x = 0; x < expertMatrixSize; x++) {
                    for (unsigned int y = 0; y < expertMatrixSize; y++) {
                        if (x >= expertNPCsWaiting.size() || y >= expertJobsToAssign.size()) {
                            expertMatrix(x, y) = 1;
                        } else {
                            boost.shared_ptr < Job > job = expertJobsToAssign[y];
                            boost.shared_ptr < NPC > npc = Game.GetNPC(expertNPCsWaiting[x]);
                            if (!npc || job.tasks.empty() ||
                                (job.tasks[0].target.X() == 0 && job.tasks[0].target.Y() == 0)) {
                                expertMatrix(x, y) = 1;
                            } else {
                                expertMatrix(x, y) = 10000 - Distance(job.tasks[0].target, npc.Position());
                            }
                            if (npc && job.RequiresTool()) {
                                if (!npc.Wielding().lock() || !npc.Wielding().lock().IsCategory(job.GetRequiredTool())) {
                                    expertMatrix(x, y) -= 2000;
                                }
                            }
                        }
                    }
                }
                std.vector < int > menialAssignments = FindBestMatching(menialMatrix);
                std.vector < int > expertAssignments = FindBestMatching(expertMatrix);

                for (unsigned int i = 0, n = 0; n < menialNPCsWaiting.size(); i++, n++) {
                    unsigned int jobNum = menialAssignments[i];
                    if (jobNum < menialJobsToAssign.size()) {
                        int npcNum = menialNPCsWaiting[n];
                        boost.shared_ptr < Job > job = menialJobsToAssign[jobNum];
                        boost.shared_ptr < NPC > npc = Game.GetNPC(npcNum);
                        if (job && npc) {
                            job.Assign(npcNum);
                            menialNPCsWaiting.erase(menialNPCsWaiting.begin() + n);
                            n--;
                            if (job.RequiresTool())
                                toolJobs[job.GetRequiredTool()].push(job);
                            npc.StartJob(job);
                        }
                    }
                }

                for (unsigned int i = 0, n = 0; n < expertNPCsWaiting.size(); i++, n++) {
                    unsigned int jobNum = expertAssignments[i];
                    if (jobNum < expertJobsToAssign.size()) {
                        int npcNum = expertNPCsWaiting[n];
                        boost.shared_ptr < Job > job = expertJobsToAssign[jobNum];
                        boost.shared_ptr < NPC > npc = Game.GetNPC(npcNum);
                        if (job && npc) {
                            job.Assign(npcNum);
                            expertNPCsWaiting.erase(expertNPCsWaiting.begin() + n);
                            n--;
                            if (job.RequiresTool())
                                toolJobs[job.GetRequiredTool()].push(job);
                            npc.StartJob(job);
                        }
                    }
                }

            }
        }
    }
}

void JobManager.RemoveJob(Action action, Coordinate location) {
    for (int i = 0; i <= PRIORITY_COUNT; ++i) {
        for (std.list < boost.shared_ptr < Job > > .iterator jobi = (i < PRIORITY_COUNT ? availableList[i].begin() : waitingList.begin()); jobi != (i < PRIORITY_COUNT ? availableList[i].end() : waitingList.end());) {
            bool remove = false;
            for (std.vector < Task > .iterator taski = ( * jobi).tasks.begin(); taski != ( * jobi).tasks.end(); ++taski) {
                if (taski.action == action && taski.target == location) {
                    remove = true;
                    break;
                }
            }
            if (remove) {
                ( * jobi).Attempts(0);
                if (( * jobi).Assigned() >= 0) {
                    boost.shared_ptr < NPC > npc = Game.GetNPC(( * jobi).Assigned());
                    boost.weak_ptr < Job > jobToRemove = * jobi;
                    ++jobi; //AbortJob will cancel the job and the invalidate the old iterator
                    if (npc) npc.AbortJob(jobToRemove);
                } else {
                    jobi = (i < PRIORITY_COUNT ? availableList[i].erase(jobi) : waitingList.erase(jobi));
                }
            } else {
                ++jobi;
            }
        }
    }
}

void JobManager.save(OutputArchive & ar,
    const unsigned int version) const {
    int count = PRIORITY_COUNT;
    ar & count;
    for (int i = 0; i < count; ++i) {
        ar & availableList[i];
    }
    ar & waitingList;
    ar & menialNPCsWaiting;
    ar & expertNPCsWaiting;
    ar & toolJobs;
    ar & failList;
}

void JobManager.load(InputArchive & ar,
    const unsigned int version) {
    if (version == 0) {
        std.list < boost.shared_ptr < Job > > oldList[3];
        ar & oldList;
        for (int i = 0; i < 3 && i < PRIORITY_COUNT; ++i) {
            availableList[i] = oldList[i];
        }
    } else {
        int count;
        ar & count;
        for (int i = 0; i < count && i < PRIORITY_COUNT; ++i) {
            ar & availableList[i];
        }
    }
    ar & waitingList;
    ar & menialNPCsWaiting;
    ar & expertNPCsWaiting;
    ar & toolJobs;
    ar & failList;
}

export let JobManager = new JobManagerClass();