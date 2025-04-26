import * as React from 'react';

const createElement = jest.fn();
const useState = jest.fn();
const useEffect = jest.fn();
const useContext = jest.fn();
const useReducer = jest.fn();
const useCallback = jest.fn();
const useMemo = jest.fn();
const useRef = jest.fn();
const createContext = jest.fn();
const forwardRef = jest.fn();
const memo = jest.fn();
const Fragment = Symbol.for('react.fragment');
const StrictMode = Symbol.for('react.strict_mode');

const React = {
  createElement,
  useState,
  useEffect,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  createContext,
  forwardRef,
  memo,
  Fragment,
  StrictMode,
};

export default React;
export * from 'react';
export {
  createElement,
  useState,
  useEffect,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  createContext,
  forwardRef,
  memo,
  Fragment,
  StrictMode,
}; 