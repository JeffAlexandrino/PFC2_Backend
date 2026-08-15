import express from "express";

declare global {
  namespace Express {
    interface Request {
      impostos?: Record<string,any>
      categoria?: Record<string,any>
      fabricante?: Record<string,any>
      fornecedor?: Record<string,any>
    }
  }
}