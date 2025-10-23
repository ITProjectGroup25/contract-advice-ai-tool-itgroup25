"use client";

import { Palette } from "lucide-react";
import { useEffect, useState } from "react";

import {
  slateTheme,
  violetTheme,
  redTheme,
  blueTheme,
  orangeTheme,
  neutralTheme,
} from "@/actions/theme";
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarTrigger,
} from "@/components/ui/menubar";

export function ThemeChange() {
  const storedThemeString = localStorage.getItem("ai-form-builder-theme");
  const selectedTheme = storedThemeString ? JSON.parse(storedThemeString) : slateTheme;

  const [theme, setTheme] = useState(selectedTheme);

  useEffect(() => {
    Object.entries(theme).forEach(([key, value]) => {
      if (typeof value === "string") {
        document.documentElement.style.setProperty(`--${key}`, value as string);
      }
    });
  }, [theme]);

  const handleSelectTheme = (selectedTheme: any) => {
    if (selectedTheme === "Slate") {
      setTheme(slateTheme);
      localStorage.setItem("ai-form-builder-theme", JSON.stringify(slateTheme));
    } else if (selectedTheme === "Violet") {
      setTheme(violetTheme);
      localStorage.setItem("ai-form-builder-theme", JSON.stringify(violetTheme));
    } else if (selectedTheme === "Red") {
      setTheme(redTheme);
      localStorage.setItem("ai-form-builder-theme", JSON.stringify(redTheme));
    } else if (selectedTheme == "Blue") {
      setTheme(blueTheme);
      localStorage.setItem("ai-form-builder-theme", JSON.stringify(blueTheme));
    } else if (selectedTheme == "Orange") {
      setTheme(orangeTheme);
      localStorage.setItem("ai-form-builder-theme", JSON.stringify(orangeTheme));
    } else if (selectedTheme == "Neutral") {
      setTheme(neutralTheme);
      localStorage.setItem("ai-form-builder-theme", JSON.stringify(neutralTheme));
    }
  };

  const handleChange = (e: any) => {
    handleSelectTheme(e.target.textContent);
    console.log("Selected Theme:", e.target.textContent);
  };
  return (
    <Menubar className="hover:cursor-pointer" onClick={(e) => handleChange(e)}>
      <MenubarMenu>
        {/* <MenubarTrigger>
          Themes <Palette />
        </MenubarTrigger> */}
        <MenubarTrigger>
          <span className="flex items-center">
            <span className="mr-2">
              <Palette />
            </span>
            <span className="hidden md:inline-block">Themes</span>
          </span>
        </MenubarTrigger>
        <MenubarContent>
          <MenubarRadioGroup onChange={handleChange}>
            <MenubarRadioItem value="slate">
              <span className="mr-4 h-3 w-3 rounded-full bg-slate-900"></span>
              Slate
            </MenubarRadioItem>
            <MenubarRadioItem value="red">
              <span className="mr-4 h-3 w-3 rounded-full bg-red-900"></span>
              Red
            </MenubarRadioItem>
            <MenubarRadioItem value="orange">
              <span className="mr-4 h-3 w-3 rounded-full bg-orange-900"></span>
              Orange
            </MenubarRadioItem>
            <MenubarRadioItem value="blue">
              <span className="mr-4 h-3 w-3 rounded-full bg-blue-900"></span>
              Blue
            </MenubarRadioItem>
            <MenubarRadioItem value="violet">
              <span className="mr-4 h-3 w-3 rounded-full bg-violet-900"></span>
              Violet
            </MenubarRadioItem>
            <MenubarRadioItem value="neautral">
              <span className="mr-4 h-3 w-3 rounded-full bg-neutral-900"></span>
              Neutral
            </MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
