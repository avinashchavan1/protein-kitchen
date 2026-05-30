// nav.jsx — navigation + notify context shared across page modules.
import React from 'react';
import { PK_DATA } from './data/data.js';

export const PKNavCtx = React.createContext(null);
export function useNav() { return React.useContext(PKNavCtx); }
export function getRecipe(id) { return PK_DATA.recipes.find(r => r.id === id); }
