import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";

type Props = any;

const Res = ({ data, cols, rows }: Props) => {
  return (
    <div className="overflow-x-auto">
      {data && cols && (
        <Table aria-label="Example static collection table">
          <TableHeader columns={cols}>
            {(column) => (
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
            {(rows || []).map((row, index) => (
              <TableRow key={index}>
                {row.answers.map((answer, idx) => (
                  <TableCell key={idx} className="font-light">
                    <div className="line-clamp-2">
                      {answer.value == null
                        ? answer?.fieldOption?.text
                        : answer.value}
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
