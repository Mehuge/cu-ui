/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/lodash.d.ts" />

var GRID_CELL_WIDTH = 16;
var GRID_CELL_HEIGHT = 16;

var COMPONENT_WIDTH = 64;
var COMPONENT_HEIGHT = 64;

var PHYSICAL_COMPONENT_NETWORK = 'physical';
var MAGIC_COMPONENT_NETWORK = 'magic';
var COMBO_A_COMPONENT_NETWORK = 'comboA';
var COMBO_B_COMPONENT_NETWORK = 'comboB';
var RANGE_A_COMPONENT_NETWORK = 'rangeA';
var RANGE_B_COMPONENT_NETWORK = 'rangeB';
var SONG_COMPONENT_NETWORK = 'song';
var SHOUT_COMPONENT_NETWORK = 'shout';

enum ComponentBranchDirection {
    Horizontal = 0,
    Vertical = 1,
    BottomCornerLeft = 2,
    BottomCornerRight = 3,
    TopCornerLeft = 4,
    TopCornerRight = 5,
    DiagonalLeft = 6,
    DiagonalRight = 7,
}

var ComponentBranchDirectionNames = _.values(ComponentBranchDirection).filter(value => _.isString(value));

enum ComponentBranchState {
    Disabled = 0,
    Open = 1,
    Slotted = 2
}

var ComponentBranchStateNames = _.values(ComponentBranchState).filter(value => _.isString(value));

enum ComponentType {
    Primary = 0,
    Secondary = 1,
    OptionalModifier = 2,
    SpecialModal = 3,
    IndependantModal = 4
}

var ComponentTypeValues = _.values(ComponentType).filter(value => _.isNumber(value));

enum ComponentPath {
    'Path 1' = 0,
    'Path 2' = 1,
    'Path 3' = 2,
    'Path 4' = 3
}

enum ComponentSubType {
    None = 0,
    // Magic
    Rune =          1 << 0,
    Shape =         1 << 1,
    Range =         1 << 2,
    Size =          1 << 3,
    Infusion =      1 << 4,
    Focus =         1 << 5,
    Transposition = 1 << 6,
    // Physical
    Weapon =        1 << 7,
    Style =         1 << 8,
    Speed =         1 << 9,
    Potential =     1 << 10,
    Target =        1 << 11,
    Stance =        1 << 12,
    // Ranged
    RangedWeapon =  1 << 13,
    Load =          1 << 14,
    Prepare =       1 << 15,
    Draw =          1 << 16,
    Aim =           1 << 17,
    // Sound
    Voice =         1 << 18,
    Instrument =    1 << 19,
    Shout =         1 << 20,
    Song =          1 << 21,
    Inflection =    1 << 22,
    Technique =     1 << 23,
    // TODO : remove these when abilities get updated, these are to cull components from showing in the UI
    DeadPrimary =   1 << 24,
    DeadSecondary = 1 << 25
}

var ComponentSubTypeValues = _.values(ComponentSubType).filter(value => _.isNumber(value) && value != ComponentSubType.None);

var ComponentBranchStateCssClasses = ComponentBranchStateNames.map(name => name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());

// Keep in sync with ValueModifierType in Server
enum ValueModifierType {
    Additive,
    Multiplicative,
}