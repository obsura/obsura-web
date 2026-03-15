/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ImageMode } from "../image";
import { TextMode } from "../text";
import { RedactionMode } from "../../lib/types";

interface AppWorkspaceProps {
  mode: RedactionMode;
}

export const AppWorkspace = ({ mode }: AppWorkspaceProps) => {
  return (
    <div className="min-h-[500px] rounded-2xl border border-stone-200 bg-white p-6 shadow-md shadow-stone-200/30 dark:shadow-black/25 md:p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {mode === "text" ? <TextMode /> : <ImageMode />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
