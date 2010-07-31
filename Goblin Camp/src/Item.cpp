/* Copyright 2010 Ilkka Halila
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
#include "stdafx.hpp"

#include <libtcod.hpp>
#include <boost/shared_ptr.hpp>
#include <boost/algorithm/string.hpp>
#ifdef DEBUG
#include <iostream>
#include <boost/format.hpp>
#endif

#include "Item.hpp"
#include "Game.hpp"
#include "Map.hpp"
#include "Logger.hpp"
#include "StockManager.hpp"
#include "Attack.hpp"

std::vector<ItemPreset> Item::Presets = std::vector<ItemPreset>();
std::vector<ItemCat> Item::Categories = std::vector<ItemCat>();
std::map<std::string, ItemType> Item::itemTypeNames = std::map<std::string, ItemType>();
std::map<std::string, ItemType> Item::itemCategoryNames = std::map<std::string, ItemType>();

Item::Item(Coordinate pos, ItemType typeval, int owner, std::vector<boost::weak_ptr<Item> > components) : Entity(),
	type(typeval),
	flammable(false),
	attemptedStore(false),
	decayCounter(-1),
	ownerFaction(owner),
	container(boost::weak_ptr<Item>())
{
	//Remember that the components are destroyed after this constructor!
	x = pos.X();
	y = pos.Y();

	name = Item::Presets[type].name;
	categories = Item::Presets[type].categories;
	graphic = Item::Presets[type].graphic;
	color = Item::Presets[type].color;
	if (Item::Presets[type].decays) decayCounter = Item::Presets[type].decaySpeed;

	for (int i = 0; i < (signed int)components.size(); ++i) {
		if (components[i].lock()) 
			color = TCODColor::lerp(color, components[i].lock()->Color(), 0.5f);
	}

	if (ownerFaction == 0) { //Player owned
		StockManager::Inst()->UpdateQuantity(type, 1);
	}

	attack = Item::Presets[type].attack;
}

Item::~Item() {
#ifdef DEBUG
	std::cout<<"Item destroyed\n";
#endif
	if (ownerFaction == 0) {
		StockManager::Inst()->UpdateQuantity(type, -1);
	}
}

void Item::Draw(Coordinate upleft, TCODConsole* console) {
	int screenx = x - upleft.X();
	int screeny = y - upleft.Y();
	if (!container.lock() && screenx >= 0 && screenx < console->getWidth() && screeny >= 0 && screeny < console->getHeight()) {
		console->putCharEx(screenx, screeny, graphic, color, Map::Inst()->BackColor(x,y));
	}
}

ItemType Item::Type() {return type;}
bool Item::IsCategory(ItemCategory category) { return (categories.find(category) != categories.end());}
TCODColor Item::Color() {return color;}
void Item::Color(TCODColor col) {color = col;}

void Item::Position(Coordinate pos) {
	x = pos.X(); y = pos.Y();
}
Coordinate Item::Position() {
	if (container.lock()) return container.lock()->Position();
	return this->Entity::Position();
}

void Item::Reserve(bool value) {
	reserved = value;
	if (!reserved && !container.lock() && !attemptedStore) {
		Game::Inst()->StockpileItem(boost::static_pointer_cast<Item>(shared_from_this()));
		attemptedStore = true;
	}
}

void Item::PutInContainer(boost::weak_ptr<Item> con) {
	container = con;
	attemptedStore = false;

	if (container.lock()) Game::Inst()->ItemContained(boost::static_pointer_cast<Item>(shared_from_this()), true);
	else Game::Inst()->ItemContained(boost::static_pointer_cast<Item>(shared_from_this()), false);

	if (!container.lock() && !reserved) {
		Game::Inst()->StockpileItem(boost::static_pointer_cast<Item>(shared_from_this()));
		attemptedStore = true;
	}
}
boost::weak_ptr<Item> Item::ContainedIn() {return container;}

int Item::Graphic() {return graphic;}

Attack Item::GetAttack() const {return attack;}

std::string Item::ItemTypeToString(ItemType type) {
	return Item::Presets[type].name;
}

ItemType Item::StringToItemType(std::string str) {
	boost::to_upper(str);
	return itemTypeNames[str];
}

std::string Item::ItemCategoryToString(ItemCategory category) {
	return Item::Categories[category].name;
}

ItemCategory Item::StringToItemCategory(std::string str) {
	boost::to_upper(str);
	return Item::itemCategoryNames[str];
}

std::vector<ItemCategory> Item::Components(ItemType type) {
	return Item::Presets[type].components;
}

ItemCategory Item::Components(ItemType type, int index) {
	return Item::Presets[type].components[index];
}

enum ItemListenerMode {
	ITEMMODE,
	CATEGORYMODE,
	COMPONENTMODE
};

class ItemListener : public ITCODParserListener {
	ItemListenerMode mode;
	/*preset[x] holds item names as strings untill all items have been
	read, and then they are converted into ItemTypes */
	std::vector<std::string> presetGrowth;
	std::vector<std::vector<std::string> > presetFruits;
	std::vector<std::vector<std::string> > presetDecay;
	std::vector<std::string> presetProjectile;
	std::vector<std::string> presetCategoryParent;
	int firstCategoryIndex;
	int firstItemIndex;

public:
	ItemListener() : ITCODParserListener(),
		mode(CATEGORYMODE),
		firstCategoryIndex(Item::Categories.size()),
		firstItemIndex(Item::Presets.size())
	{
	}

	void translateNames() {
		for (unsigned int i = 0; i < presetCategoryParent.size(); ++i) {
			if (presetCategoryParent[i] != "") {
				Item::Categories[firstCategoryIndex+i].parent = &Item::Categories[Item::StringToItemCategory(presetCategoryParent[i])];
			}
		}

		/*Misleading to iterate through presetGrowth because we're handling everything else here,
		but presetGrowth.size() = the amount of items read in. Just remember to add firstItemIndex,
		because this items.dat may not be the first one read in, and we don't want to overwrite
		existing items*/
		for (unsigned int i = 0; i < presetGrowth.size(); ++i) {

			for (std::set<ItemCategory>::iterator cati = Item::Presets[firstItemIndex+i].categories.begin();
				cati != Item::Presets[firstItemIndex+i].categories.end(); ++cati) {
					if (Item::Categories[*cati].parent) {
#ifdef DEBUG
						std::cout<<"Item has a parent ->"<<Item::Categories[*cati].parent->name<<" = ("<<Item::StringToItemCategory(Item::Categories[*cati].parent->name)<<")\n";
#endif
						Item::Presets[firstItemIndex+i].categories.insert(Item::StringToItemCategory(Item::Categories[*cati].parent->name));
					}
			}
			
#ifdef DEBUG
			if (presetGrowth[i] != "") {
				Item::Presets[firstItemIndex+i].growth = Item::StringToItemType(presetGrowth[i]);
				std::cout<<"Translating "<<presetGrowth[i]<<" into growth id "<<Item::StringToItemType(presetGrowth[i])<<"\n";
			} else {
				std::cout<<"No growth defined for "<<Item::Presets[firstItemIndex+i].name<<"\n";
			}
			std::cout<<"Growth id = "<<Item::Presets[firstItemIndex+i].growth<<"\n";
#else
			if (presetGrowth[i] != "") Item::Presets[firstItemIndex+i].growth = Item::StringToItemType(presetGrowth[i]);
#endif
			for (unsigned int fruit = 0; fruit < presetFruits[i].size(); ++fruit) {
				Item::Presets[firstItemIndex+i].fruits.push_back(Item::StringToItemType(presetFruits[i][fruit]));
			}
			for (unsigned int decay = 0; decay < presetDecay[i].size(); ++decay) {
				if (boost::iequals(presetDecay[i][decay], "Filth"))
					Item::Presets[firstItemIndex+i].decayList.push_back(-1);
				else
					Item::Presets[firstItemIndex+i].decayList.push_back(Item::StringToItemType(presetDecay[i][decay]));
			}

			if (presetProjectile[i] != "") Item::Presets[firstItemIndex+i].attack.Projectile(Item::StringToItemType(presetProjectile[i]));
		}
	}

private:
	bool parserNewStruct(TCODParser *parser,const TCODParserStruct *str,const char *name) {
#ifdef DEBUG
		std::cout<<(boost::format("new %s structure: '%s'\n") % str->getName() % name).str();
#endif
		if (boost::iequals(str->getName(), "category_type")) {
			mode = CATEGORYMODE;
			Item::Categories.push_back(ItemCat());
			++Game::ItemCatCount;
			Item::Categories.back().name = name;
			std::string upperName = name;
			boost::to_upper(upperName);
			Item::itemCategoryNames.insert(std::pair<std::string, ItemCategory>(upperName, Game::ItemCatCount-1));
			presetCategoryParent.push_back("");
		} else if (boost::iequals(str->getName(), "item_type")) {
			mode = ITEMMODE;
			Item::Presets.push_back(ItemPreset());
			presetGrowth.push_back("");
			presetFruits.push_back(std::vector<std::string>());
			presetDecay.push_back(std::vector<std::string>());
			++Game::ItemTypeCount;
			Item::Presets.back().name = name;
			std::string upperName = name;
			boost::to_upper(upperName);
			Item::itemTypeNames.insert(std::pair<std::string, ItemType>(upperName, Game::ItemTypeCount-1));
			presetProjectile.push_back("");
		} else if (boost::iequals(str->getName(), "attack")) {
		}

		return true;
	}

	bool parserFlag(TCODParser *parser,const char *name) {
#ifdef DEBUG
		std::cout<<(boost::format("%s\n") % name).str();
#endif
		return true;
	}

	bool parserProperty(TCODParser *parser,const char *name, TCOD_value_type_t type, TCOD_value_t value) {
#ifdef DEBUG
		std::cout<<(boost::format("%s\n") % name).str();
#endif
		if (boost::iequals(name, "category")) {
			for (int i = 0; i < TCOD_list_size(value.list); ++i) {
				ItemCategory cat = Item::StringToItemCategory((char*)TCOD_list_get(value.list,i));
				Item::Presets.back().categories.insert(cat);
			}
		} else if (boost::iequals(name, "graphic")) {
			Item::Presets.back().graphic = value.i;
		} else if (boost::iequals(name, "color")) {
			Item::Presets.back().color = value.col;
		} else if (boost::iequals(name, "components")) {
			for (int i = 0; i < TCOD_list_size(value.list); ++i) {
				Item::Presets.back().components.push_back(Item::StringToItemCategory((char*)TCOD_list_get(value.list, i)));
			}
		} else if (boost::iequals(name, "containin")) {
			Item::Presets.back().containIn = Item::StringToItemCategory(value.s);
			Item::Presets.back().components.push_back(Item::StringToItemCategory(value.s));
		} else if (boost::iequals(name, "nutrition")) {
			Item::Presets.back().nutrition = value.i;
			Item::Presets.back().organic = true;
		} else if (boost::iequals(name, "growth")) {
			presetGrowth.back() = value.s;
			Item::Presets.back().organic = true;
		} else if (boost::iequals(name, "fruits")) {
			for (int i = 0; i < TCOD_list_size(value.list); ++i) {
				presetFruits.back().push_back((char*)TCOD_list_get(value.list,i));
			}
			Item::Presets.back().organic = true;
		} else if (boost::iequals(name, "multiplier")) {
			Item::Presets.back().multiplier = value.i;
		} else if (boost::iequals(name, "containerSize")) {
			Item::Presets.back().container = value.i;
		} else if (boost::iequals(name, "fitsin")) {
			Item::Presets.back().fitsin = Item::StringToItemCategory(value.s);
		} else if (boost::iequals(name, "decay")) {
			Item::Presets.back().decays = true;
			for (int i = 0; i < TCOD_list_size(value.list); ++i) {
				presetDecay.back().push_back((char*)TCOD_list_get(value.list,i));
			}
		} else if (boost::iequals(name, "decaySpeed")) {
			Item::Presets.back().decaySpeed = value.i;
		} else if (boost::iequals(name,"type")) {
			Item::Presets.back().attack.Type(Attack::StringToDamageType(value.s));
		} else if (boost::iequals(name,"damage")) {
			Item::Presets.back().attack.Amount(value.dice);
		} else if (boost::iequals(name,"cooldown")) {
			Item::Presets.back().attack.CooldownMax(value.i);
		} else if (boost::iequals(name,"statusEffects")) {
			for (int i = 0; i < TCOD_list_size(value.list); ++i) {
				Item::Presets.back().attack.StatusEffects()->push_back(std::pair<StatusEffectType, int>(StatusEffect::StringToStatusEffectType((char*)TCOD_list_get(value.list,i)), 100));
			}
		} else if (boost::iequals(name,"effectChances")) {
			for (int i = 0; i < TCOD_list_size(value.list); ++i) {
				Item::Presets.back().attack.StatusEffects()->at(i).second = (int)TCOD_list_get(value.list,i);
			}
		} else if (boost::iequals(name,"projectile")) {
			presetProjectile.back() = value.s;
		} else if (boost::iequals(name,"parent")) {
			presetCategoryParent.back() = value.s;
		}
		return true;
	}

	bool parserEndStruct(TCODParser *parser,const TCODParserStruct *str,const char *name) {
#ifdef DEBUG
		std::cout<<(boost::format("end of %s structure\n") % name).str();
#endif
		return true;
	}
	void error(const char *msg) {
		Logger::Inst()->output<<"ItemListener: "<<msg<<"\n";
		Game::Inst()->Exit();
	}
};

void Item::LoadPresets(std::string filename) {
	TCODParser parser = TCODParser();
	TCODParserStruct* categoryTypeStruct = parser.newStructure("category_type");
	categoryTypeStruct->addProperty("parent", TCOD_TYPE_STRING, false);

	TCODParserStruct* itemTypeStruct = parser.newStructure("item_type");
	itemTypeStruct->addListProperty("category", TCOD_TYPE_STRING, true);
	itemTypeStruct->addProperty("graphic", TCOD_TYPE_INT, true);
	itemTypeStruct->addProperty("color", TCOD_TYPE_COLOR, true);
	itemTypeStruct->addListProperty("components", TCOD_TYPE_STRING, false);
	itemTypeStruct->addProperty("containIn", TCOD_TYPE_STRING, false);
	itemTypeStruct->addProperty("nutrition", TCOD_TYPE_INT, false);
	itemTypeStruct->addProperty("growth", TCOD_TYPE_STRING, false);
	itemTypeStruct->addListProperty("fruits", TCOD_TYPE_STRING, false);
	itemTypeStruct->addProperty("multiplier", TCOD_TYPE_INT, false);
	itemTypeStruct->addProperty("containerSize", TCOD_TYPE_INT, false);
	itemTypeStruct->addProperty("fitsin", TCOD_TYPE_STRING, false);
	itemTypeStruct->addListProperty("decay", TCOD_TYPE_STRING, false);
	itemTypeStruct->addProperty("decaySpeed", TCOD_TYPE_INT, false);

	TCODParserStruct *attackTypeStruct = parser.newStructure("attack");
	const char* damageTypes[] = { "slashing", "piercing", "blunt", "magic", "fire", "cold", "poison", "wielded", NULL };
	attackTypeStruct->addValueList("type", damageTypes, true);
	attackTypeStruct->addProperty("damage", TCOD_TYPE_DICE, false);
	attackTypeStruct->addProperty("cooldown", TCOD_TYPE_INT, false);
	attackTypeStruct->addListProperty("statusEffects", TCOD_TYPE_STRING, false);
	attackTypeStruct->addListProperty("effectChances", TCOD_TYPE_INT, false);
	attackTypeStruct->addFlag("ranged");
	attackTypeStruct->addProperty("projectile", TCOD_TYPE_STRING, false);

	itemTypeStruct->addStructure(attackTypeStruct);

	ItemListener* itemListener = new ItemListener();
	parser.run(filename.c_str(), itemListener);
	itemListener->translateNames();
}

void Item::Faction(int val) {
	if (val == 0 && ownerFaction != 0) { //Transferred to player
		StockManager::Inst()->UpdateQuantity(type, 1);
	} else if (val != 0 && ownerFaction == 0) { //Transferred from player
		StockManager::Inst()->UpdateQuantity(type, -1);
	}
	ownerFaction = val;
}

int Item::Faction() const { return ownerFaction; }

int Item::RelativeValue() {
	TCOD_dice_t amount = attack.Amount();
	int minDamage = (int)(amount.nb_dices + amount.addsub);
	int maxDamage = (int)((amount.nb_dices * amount.nb_faces) + amount.addsub);
	return (minDamage + maxDamage) / 2;
}

ItemCat::ItemCat() : flammable(false),
	name("Category schmategory"),
	parent(0)
{}

std::string ItemCat::GetName() {
    return name;
}

ItemPreset::ItemPreset() :
graphic('?'),
	color(TCODColor::pink),
	name("Preset default"),
	categories(std::set<ItemCategory>()),
	nutrition(-1),
	growth(-1),
	fruits(std::list<ItemType>()),
	organic(false),
	container(0),
	multiplier(1),
	fitsin(-1),
	containIn(-1),
	decays(false),
	decaySpeed(0),
	decayList(std::vector<ItemType>()),
	attack(Attack())
{}

OrganicItem::OrganicItem(Coordinate pos, ItemType typeVal) : Item(pos, typeVal),
	nutrition(-1),
	growth(-1)
{}

int OrganicItem::Nutrition() { return nutrition; }
void OrganicItem::Nutrition(int val) { nutrition = val; }

ItemType OrganicItem::Growth() { return growth; }
void OrganicItem::Growth(ItemType val) { growth = val; }
