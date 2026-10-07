import { Box, Boxes, Container, Factory, HardHat, PackageOpen, Printer, Ship, Store, Truck, Warehouse } from "lucide-react";

const MAP = { Box, Boxes, Container, Factory, HardHat, PackageOpen, Printer, Ship, Store, Truck, Warehouse };
export const iconFor = (name) => MAP[name] || Box;
