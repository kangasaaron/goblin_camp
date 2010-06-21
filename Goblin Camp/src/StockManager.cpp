#include "StockManager.hpp"
#include "Item.hpp"
#include "Construction.hpp"
#include "NatureObject.hpp"
#include "Job.hpp"

#ifdef DEBUG
#include <iostream>
#endif

StockManager* StockManager::instance = 0;
StockManager* StockManager::Inst() {
	if (!instance) {
		instance = new StockManager();
	}
	return instance;
}

StockManager::StockManager(void){
	//Initialize all quantities to -1 (== not visible in stocks screen)
	for (unsigned int i = 0; i < Item::Categories.size(); ++i) {
		categoryQuantities.insert(std::pair<ItemCategory,int>(i,-1));
	}
	for (unsigned int i = 0; i < Item::Presets.size(); ++i) {
		typeQuantities.insert(std::pair<ItemType,int>(i,-1));
#ifdef DEBUG
		std::cout<<"Initializing typeQuantity "<<Item::ItemTypeToString(i)<<" to "<<typeQuantities[i]<<"\n";
#endif
	}

	//Figure out which items are producable, this is so that we won't show _all_ item types in the
	//stock manager screen. Things such as trash and plant mid-growth types won't show this way
	for (unsigned int item = 0; item < Item::Presets.size(); ++item) {
		if (Item::Presets[item].growth < 0) { //Doesn't grow into anything, this excludes seeds and plants
			//Now figure out if this item is producable either from a workshop, or designations
			bool producerFound = false;
			for (unsigned int cons = 0; cons < Construction::Presets.size(); ++cons) { //Look through all constructions
				for (unsigned int prod = 0; prod < Construction::Presets[cons].products.size(); ++prod) { //Products
					if (Construction::Presets[cons].products[prod] == item) {
						//This construction has this itemtype as a product
						producables.insert(item);
						producers.insert(std::pair<ItemType, ConstructionType>(item, cons));
						producerFound = true;
						break;
					}
				}
			}

			if (!producerFound) {//Haven't found a producer, so check NatureObjects if a tree has this item as a component
				for (unsigned int natObj = 0; natObj < NatureObject::Presets.size(); ++natObj) {
					if (NatureObject::Presets[natObj].tree) {
						for (std::list<ItemType>::iterator compi = NatureObject::Presets[natObj].components.begin(); 
							compi != NatureObject::Presets[natObj].components.end(); ++compi) {
							if (*compi == item) {
								producables.insert(item);
								fromTrees.insert(item);
								UpdateQuantity(item, 0);
							}
						}
					}
				}
			}
		}
	}
}


StockManager::~StockManager(void){
}

void StockManager::Update() {
	for (std::set<ItemType>::iterator prodi = producables.begin(); prodi != producables.end(); ++prodi) {
		if (minimums[*prodi] > 0) {
			int difference = minimums[*prodi] - typeQuantities[*prodi];
			if (difference > 0) {
				difference = std::max(1, difference / Item::Presets[*prodi].multiplier);
				//Difference is now equal to how many jobs are required to fulfill the deficit
				if (fromTrees.find(*prodi) != fromTrees.end()) { //Item is a component of trees
					//Pick a designated tree and go chop it

				} else if (fromEarth.find(*prodi) != fromEarth.end()) {
				} else {
					//First get all the workshops capable of producing this product
					std::pair<std::multimap<ConstructionType, boost::weak_ptr<Construction> >::iterator,
						std::multimap<ConstructionType, boost::weak_ptr<Construction> >::iterator> 
						workshopRange = workshops.equal_range(producers[*prodi]);
					//By dividing the difference by the amount of workshops we get how many jobs each one should handle
					difference = std::max(1, difference / std::distance(workshopRange.first, workshopRange.second));
					//Now we just check that each workshop has 'difference' amount of jobs for this product
					for (std::multimap<ConstructionType, boost::weak_ptr<Construction> >::iterator worki =
						workshopRange.first; worki != workshopRange.second; ++worki) {
							int jobsFound = 0;
							for (int jobi = 0; jobi < (signed int)worki->second.lock()->JobList()->size(); ++jobi) {
								if ((*worki->second.lock()->JobList())[jobi] == *prodi) ++jobsFound;
							}
							if (jobsFound < difference) {
								for (int i = 0; i < difference - jobsFound; ++i) {
									worki->second.lock()->AddJob(*prodi);
								}
							}
					}
				}
			}
		}
	}
}

void StockManager::UpdateQuantity(ItemType type, int quantity) {
	//If we receive an update about a new type, it should be made available
	//Constructions issue a 0 quantity update when they are built
#ifdef DEBUG
	std::cout<<"Quantity update "<<Item::ItemTypeToString(type)<<"\n";
#endif

	if (typeQuantities[type] == -1) typeQuantities[type] = 0;

	typeQuantities[type] += quantity;
	for (std::set<ItemCategory>::iterator cati = Item::Presets[type].categories.begin(); cati != Item::Presets[type].categories.end(); ++cati) {
		if (categoryQuantities[*cati] == -1) categoryQuantities[*cati] = 0;
		categoryQuantities[*cati] += quantity;
#ifdef DEBUG
		std::cout<<Item::ItemCategoryToString(*cati)<<" "<<quantity<<"\n";
#endif
	}
#ifdef DEBUG
	std::cout<<Item::ItemTypeToString(type)<<" "<<quantity<<"\n";
#endif
}

int StockManager::CategoryQuantity(ItemCategory cat) { return categoryQuantities[cat]; }
int StockManager::TypeQuantity(ItemType type) { return typeQuantities[type]; }

std::set<ItemType>* StockManager::Producables() { return &producables; }

void StockManager::UpdateWorkshops(boost::weak_ptr<Construction> cons, bool add) {
	if (add) {
		workshops.insert(std::pair<ConstructionType, boost::weak_ptr<Construction> >(cons.lock()->type(), cons));
	} else {
		//Because it is being removed, this has been called from a destructor which means
		//that the construction no longer exists, and the weak_ptr should give !lock
		for (std::multimap<ConstructionType, boost::weak_ptr<Construction> >::iterator worki = workshops.begin();
			worki != workshops.end(); ++worki) {
				if (!worki->second.lock()) {
					workshops.erase(worki);
					break;
				}
		}
	}
}

int StockManager::Minimum(ItemType item) {return minimums[item];}

void StockManager::AdjustMinimum(ItemType item, int value) {
	minimums[item] += value;
	if (minimums[item] < 0) minimums[item] = 0;
}