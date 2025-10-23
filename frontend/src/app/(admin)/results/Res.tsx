import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import type { SubmissionTable, SubmissionColumn, SubmissionRow } from "./types";

type ResultsProps = {
  data: SubmissionTable | null;
  cols: SubmissionColumn[];
  rows: SubmissionRow[];
};

const Res = ({ data, cols, rows }: ResultsProps) => {
  const hasData = Boolean(data?.columns.length && data.data.length);

  return (
    <div className="overflow-x-auto">
      {hasData && (
        <Table aria-label="Form submissions">
          <TableHeader columns={cols}>
            {(column: SubmissionColumn) => (
              <TableColumn key={column.text} className="font-semibold">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        style={{
                          width: "150px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {column.text}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{column.text}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableColumn>
            )}
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                {row.answers.map((answer, idx) => (
                  <TableCell key={idx} className="font-light">
                    <div className="line-clamp-2">
                      {answer.value == null ? (answer.fieldOption?.text ?? "") : answer.value}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Res;
