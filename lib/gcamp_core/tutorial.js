/*Copyright 2010-2011 Ilkka Halila
 * This file is part of Goblin Camp.
 * 
 * Goblin Camp is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Goblin Camp is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License 
 * along with Goblin Camp. If not, see <http://www.gnu.org/licenses/>.
 */
import { gcamp } from "../gcamp/gcamp.js";
import { config } from "../gcamp/config.js";
import { events, EventListener } from "../gcamp/events.js";

class Tutorial extends EventListener {


    constructor() {
        super();
        this.stage = -1;
        this.piles = 0;
        this.planks = 0;
    }

    onGameStart() {
        if (config.getCVar("tutorial") == '1')
            this.stage = 0
        else
            this.stage = -1

        if (this.stage == 0) {
            function startMessage() {
                config.setCVar("tutorial", '0')
                ui.messageBox(
                    `Welcome to the Goblin Camp tutorial!              
You're best off by first building a pile:         
                                                  
        -Right-click to open the menu             
        -choose Build->Basics->Pile               
                                                  
Then just choose a suitable spot for it and click.`)
            }

            gcamp.delay(100, startMessage)
        }
    }


    onBuildingCreated(construct, x, y) {
        if (this.stage == 0 && construct.getTypeString().lower() == "pile")
            this.piles = this.piles + 1
        if (this.stage == 0 && this.piles >= 1) {
            function pileMessage1() {
                ui.messageBox(
                    `Good work! Your goblins will store everything in  
the pile, and it will automatically grow as stuff 
is stored in it. It is a good idea to build  more 
piles, as moving through a pile is difficult and  
a large pile will really slow things down.        `)
                ui.announce("Remember to build more piles as needed!")
            }
            gcamp.delay(125, pileMessage1)

            function pileMessage2() {
                ui.messageBox(
                    `Next you should do two things:                    
                                                  
    -Choose Orders->Designate trees and designate 
trees that can be chopped down for wood.          
    -Open the Stockmanager and shift+click on the 
+-sign underneath 'Wood log' a few times.         
                                                  
Soon you should see two of your goblins grab the  
two axes and go forth to chop some trees down.    
                                                  
The axes will degrade as they're used, and        
eventually break, so you'll need a stone quarry   
once you're established to be able to keep felling
trees.                                            
                                                  
You can also filter the stockmanager by typing in 
part of an items name or category, allowing you   
to quickly find what you need.                    `)
                ui.announce("Designate trees and increase the wood log minimum")
            }
            gcamp.delay(1000, pileMessage2)
            this.stage = 10
        } else if (this.stage == 20 && construct.getTypeString().toLowerCase() == "saw pit") {
            ui.messageBox(
                `Now order up some planks (50 is a good number)    
from the Stock Manager, we'll need those for more 
advanced constructions.                           `)
            this.stage = 30
        }
    }


    onItemCreated(item, x, y) {
        if (this.stage == 10 && item.getTypeString().lower() == "wood log") {
            ui.messageBox(
                `Now would be a good time to designate a farm plot.
Choose some suitable place, designate it, and     
enable planting of all seed types by              
left-clicking the farm plot and clicking the boxes
in the sidebar.                                   
(Build->Basics->Farm plot)"`);
            ui.announce("Build a farm plot")

            function sawpitMessage() {
                ui.messageBox(
                    `Alright, now you have wood logs! Once the logs    
have been stored in the stockpile, choose         
Build->Workshops->Saw pit.                        
Place it somewhere convenient.`)
                ui.announce("Build a saw pit")
            }
            gcamp.delay(1000, sawpitMessage)
            this.stage = 20
        } else if (this.stage == 30 && item.getTypeString().lower() == "wood plank") {
            this.planks = this.planks + 1
            if (this.planks >= 25) {
                gcamp.delay(75, () => ui.messageBox(
                    `Now build a carpenter, it'll allow you to build   
crates to store most items and wooden clubs for   
your future military. Remember to build buckets,  
you'll need them to transport filth to the        
spawning pool and water to put out fires.         `))
                gcamp.delay(1000, () => ui.messageBox(
                    `It's a good idea to check out what your territory 
looks like time to time.                          

        Territory->Toggle territory overlay       
                                                  
It'll expand automatically as you build things,   
you just need to remember that goblins will mostly
_not_ venture outside your territory to pick items
up or otherwise. They will favour a drinking spot 
inside your territory as well                     `))
                gcamp.delay(1750, () =>
                    ui.messageBox(
                        `This is the end of the tutorial.                  
It's a good idea to choose a site for the spawning
pool soon.                                        
(Remember to activate filth and corpse dumping   
jobs by right-clicking the spawning pool)         
                                                  
Most constructions will have a description in     
their tooltip, so look through the menus for what 
you can build. As you build more, and get more    
orcs and goblins from the spawning pool you'll    
advance through tiers and gain access to more     
advanced buildings.                               
                                                  
Also don't forget about defenses. Dig some        
ramparts, build traps, and establish some guard   
squads!                                           `
                    )
                );

                this.stage = 40
            }
        }
    }
}
events.register(Tutorial);