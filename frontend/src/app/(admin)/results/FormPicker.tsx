"use client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";

const FormsPicker = (props: any) => {
  const { options, setData, setCols, setRows } = props;

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const formId = searchParams.get("formId") || options[0].value.toString();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      console.log("searchParams", searchParams);
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const res = await getSubmissions(51); // Call your API function here
  //       if (res) {
  //         const transformedData: TableProps = {
  //           data: res.submissions,
  //           columns: res.questions,
  //         };
  //         setCols(res.questions);
  //         setRows(res.submissions);
  //         setData(transformedData);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   };

  //   fetchData();
  // }, []);

  const getSubmissions = async () => {};

  const fetchData = async (formId: number) => {
    try {
      const res = await getSubmissions();
      if (res) {
        const transformedData: TableProps = {
          data: res.submissions,
          columns: res.questions,
        };
        setCols(res.questions);
        setRows(res.submissions);
        setData(transformedData);
      }
      console.log("respnose", res);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData(Number(formId));
  }, [formId]); // Include formId in the dependency array

  return (
    <div className="flex gap-2 items-center">
      <Label className="font-bold">Select a form</Label>
      <Select
        value={formId}
        onValueChange={(value) => {
          router.push(pathname + "?" + createQueryString("formId", value));
          fetchData(Number(value)); // Call fetchData with the newly selected formId
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={options[0].label} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default FormsPicker;
