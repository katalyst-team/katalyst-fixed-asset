/* eslint-disable max-lines */
"use client";

import { format } from "date-fns";
import { CalendarIcon, ChevronDown, Filter, X } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import * as React from "react";
import { useShallow } from "zustand/react/shallow";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/context/user-context";
import useGetAttributeDataQuery from "@/hooks/api/attribute/useGetAttributeDataQuery";
import { AttributeItemType, AttributeTypeEnum } from "@/types/attribute";
import {
  calculateTimeframeDates,
  timeframeOptions as originalTimeframeOptions,
} from "@/utils/timeframe";

import { useLaminaLogStore } from "./store";

interface DateAttributeFilter {
  attribute_id: string;
  end_date: string;
  start_date: string;
}

const ALLOWED_DATE_ATTRIBUTE_NAMES = [
  "Tanggal Input Lamina",
  "Tanggal Keluar Lamina",
];

const ALLOWED_ATTRIBUTE_NAMES = [
  "Lamina Grade",
  "Lamina Size",
  "Mesin Keluar Lamina",
  "Mesin Masuk Lamina",
];

const PRESET_ATTRIBUTE_TYPES: AttributeTypeEnum[] = [
  AttributeTypeEnum.CHECKBOX,
  AttributeTypeEnum.SELECT,
];

const LaminaLogDateAttributeFilter: React.FC = () => {
  const { t } = useTranslation(["common", "lamina-log"]);
  const router = useRouter();
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const { currentFilters, setCurrentPage, setFilters } = useLaminaLogStore(
    useShallow((state) => ({
      currentFilters: state.filters,
      setCurrentPage: state.setCurrentPage,
      setFilters: state.setFilters,
    })),
  );

  const { data: attributeData, isLoading: isLoadingAttributes } =
    useGetAttributeDataQuery({
      limit: 1000,
      organizationId,
    });

  const [startDate, setStartDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");
  const [timeframe, setTimeframe] = React.useState<string>("all");
  const [selectedDateAttributes, setSelectedDateAttributes] =
    React.useState<DateAttributeFilter[]>([]);
  const [attributeFilters, setAttributeFilters] = React.useState<
    Record<string, string[]>
  >({});
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const urlInitialized = React.useRef(false);

  React.useEffect(() => {
    if (!router.isReady || urlInitialized.current) return;
    urlInitialized.current = true;

    const q = router.query as Record<string, string | undefined>;

    const urlStartDate = q.start_date ?? currentFilters.start_date;
    const urlEndDate = q.end_date ?? currentFilters.end_date;

    if (urlStartDate) {
      setStartDate(urlStartDate);
      setTimeframe("custom");
    }
    if (urlEndDate) setEndDate(urlEndDate);

    const urlDateAttrs =
      q.query_date_attributes ?? currentFilters.query_date_attributes;
    if (urlDateAttrs) {
      try {
        const parsed = JSON.parse(urlDateAttrs as string);
        if (parsed.date_attributes) {
          setSelectedDateAttributes(parsed.date_attributes);
        }
      } catch {
      }
    }

    const urlQueryAttrs =
      q.query_attributes ??
      (currentFilters.query_attributes
        ? JSON.stringify(currentFilters.query_attributes)
        : undefined);
    if (urlQueryAttrs) {
      try {
        const parsed = JSON.parse(
          urlQueryAttrs as string,
        ) as Record<string, string[]>;
        if (Object.keys(parsed).length > 0) {
          setAttributeFilters(parsed);
        }
      } catch {
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  const startDateValue = React.useMemo(
    () => (startDate ? new Date(startDate) : undefined),
    [startDate],
  );
  const endDateValue = React.useMemo(
    () => (endDate ? new Date(endDate) : undefined),
    [endDate],
  );

  function toStartOfDayISO(d?: Date): string {
    if (!d) return "";
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    return copy.toISOString();
  }

  function toEndOfDayISO(d?: Date): string {
    if (!d) return "";
    const copy = new Date(d);
    copy.setHours(23, 59, 59, 999);
    return copy.toISOString();
  }

  const timeframeOptions = React.useMemo(() => {
    return originalTimeframeOptions.filter((option) => option.value !== "30D");
  }, []);

  const dateAttributes = React.useMemo(() => {
    return (attributeData?.data?.attributes || []).filter(
      (attr) =>
        (attr.type === AttributeTypeEnum.DATE ||
          attr.type === AttributeTypeEnum.DATETIME) &&
        ALLOWED_DATE_ATTRIBUTE_NAMES.includes(attr.name),
    );
  }, [attributeData]);

  const selectableAttributes = React.useMemo(() => {
    return (attributeData?.data?.attributes || [])
      .filter((attr) => ALLOWED_ATTRIBUTE_NAMES.includes(attr.name))
      .sort(
        (a, b) =>
          ALLOWED_ATTRIBUTE_NAMES.indexOf(a.name) -
          ALLOWED_ATTRIBUTE_NAMES.indexOf(b.name),
      );
  }, [attributeData]);

  const handleTimeframeChange = React.useCallback(
    (selectedTimeframe: string) => {
      setTimeframe(selectedTimeframe);

      if (selectedTimeframe === "all") {
        setStartDate("");
        setEndDate("");
      } else {
        const dates = calculateTimeframeDates(selectedTimeframe);
        if (dates) {
          setStartDate(dates.startDate);
          setEndDate(dates.endDate);
        }
      }
    },
    [],
  );

  const handleAddDateAttributeFilter = (attributeId: string) => {
    setSelectedDateAttributes((prev) => {
      if (prev.find((f) => f.attribute_id === attributeId)) return prev;
      return [
        ...prev,
        {
          attribute_id: attributeId,
          end_date: "",
          start_date: "",
        },
      ];
    });
  };

  const handleUpdateDateAttributeFilter = (
    index: number,
    field: "end_date" | "start_date",
    value: string,
  ) => {
    setSelectedDateAttributes((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveDateAttributeFilter = (index: number) => {
    setSelectedDateAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleAttributeValue = (
    attributeId: string,
    value: string,
    checked: boolean,
  ) => {
    setAttributeFilters((prev) => {
      const current = prev[attributeId] ?? [];
      const next = checked
        ? [...current, value]
        : current.filter((v) => v !== value);
      const updated = { ...prev };
      if (next.length > 0) {
        updated[attributeId] = next;
      } else {
        delete updated[attributeId];
      }
      return updated;
    });
  };

  const syncUrl = (
    nextStart: string,
    nextEnd: string,
    nextDateAttrs: string | undefined,
    nextQueryAttrs: string | undefined,
  ) => {
    const nextQuery = { ...router.query };
    if (nextStart) nextQuery.start_date = nextStart;
    else delete nextQuery.start_date;
    if (nextEnd) nextQuery.end_date = nextEnd;
    else delete nextQuery.end_date;
    if (nextDateAttrs) nextQuery.query_date_attributes = nextDateAttrs;
    else delete nextQuery.query_date_attributes;
    if (nextQueryAttrs) nextQuery.query_attributes = nextQueryAttrs;
    else delete nextQuery.query_attributes;
    router.replace(
      { pathname: router.pathname, query: nextQuery },
      undefined,
      { shallow: true },
    );
  };

  const buildMergedQueryAttributes = React.useCallback(() => {
    const existing: Record<string, string[]> =
      currentFilters.query_attributes &&
      typeof currentFilters.query_attributes === "object"
        ? (currentFilters.query_attributes as Record<string, string[]>)
        : {};

    const managedIds = new Set(selectableAttributes.map((a) => a.id));
    const preserved = Object.fromEntries(
      Object.entries(existing).filter(([id]) => !managedIds.has(id)),
    );

    Object.entries(attributeFilters).forEach(([id, values]) => {
      if (values.length > 0) {
        preserved[id] = values;
      }
    });

    return preserved;
  }, [currentFilters.query_attributes, attributeFilters, selectableAttributes]);

  const handleApply = () => {
    const validDateAttrFilters = selectedDateAttributes.filter(
      (f) => f.start_date && f.end_date,
    );
    const dateAttrsStr =
      validDateAttrFilters.length > 0
        ? JSON.stringify({ date_attributes: validDateAttrFilters })
        : undefined;

    const mergedQueryAttrs = buildMergedQueryAttributes();
    const hasQueryAttrs = Object.keys(mergedQueryAttrs).length > 0;
    const queryAttrsStr = hasQueryAttrs
      ? JSON.stringify(mergedQueryAttrs)
      : undefined;

    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      cursor: undefined,
      end_date: endDate || undefined,
      query_attributes: hasQueryAttrs ? mergedQueryAttrs : undefined,
      query_date_attributes: dateAttrsStr,
      start_date: startDate || undefined,
    }));

    syncUrl(startDate, endDate, dateAttrsStr, queryAttrsStr);
    setIsPopoverOpen(false);
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setTimeframe("all");
    setSelectedDateAttributes([]);
    setAttributeFilters({});

    const managedIds = new Set(selectableAttributes.map((a) => a.id));
    const existing: Record<string, string[]> =
      currentFilters.query_attributes &&
      typeof currentFilters.query_attributes === "object"
        ? (currentFilters.query_attributes as Record<string, string[]>)
        : {};
    const preserved = Object.fromEntries(
      Object.entries(existing).filter(([id]) => !managedIds.has(id)),
    );
    const hasQueryAttrs = Object.keys(preserved).length > 0;
    const queryAttrsStr = hasQueryAttrs
      ? JSON.stringify(preserved)
      : undefined;

    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      cursor: undefined,
      end_date: undefined,
      query_attributes: hasQueryAttrs ? preserved : undefined,
      query_date_attributes: undefined,
      start_date: undefined,
    }));
    syncUrl("", "", undefined, queryAttrsStr);
    setIsPopoverOpen(false);
  };

  const handleCancel = () => {
    const storeStart = currentFilters.start_date ?? "";
    const storeEnd = currentFilters.end_date ?? "";
    setStartDate(storeStart);
    setEndDate(storeEnd);
    setTimeframe(storeStart || storeEnd ? "custom" : "all");

    const storeDateAttrs: DateAttributeFilter[] = (() => {
      if (!currentFilters.query_date_attributes) return [];
      try {
        const parsed = JSON.parse(
          currentFilters.query_date_attributes as string,
        );
        return parsed.date_attributes || [];
      } catch {
        return [];
      }
    })();
    setSelectedDateAttributes(storeDateAttrs);

    const managedIds = new Set(selectableAttributes.map((a) => a.id));
    const storeQueryAttrs: Record<string, string[]> =
      currentFilters.query_attributes &&
      typeof currentFilters.query_attributes === "object"
        ? (currentFilters.query_attributes as Record<string, string[]>)
        : {};
    const revertedAttrs: Record<string, string[]> = {};
    Object.entries(storeQueryAttrs).forEach(([id, values]) => {
      if (managedIds.has(id) && Array.isArray(values)) {
        revertedAttrs[id] = values;
      }
    });
    setAttributeFilters(revertedAttrs);

    setIsPopoverOpen(false);
  };

  const hasActiveAttributes = selectableAttributes.some((attr) => {
    const qa = currentFilters.query_attributes;
    if (!qa || typeof qa !== "object") return false;
    const values = (qa as Record<string, string[]>)[attr.id];
    return Array.isArray(values) && values.length > 0;
  });

  const hasActiveFilters =
    Boolean(currentFilters.start_date) ||
    Boolean(currentFilters.end_date) ||
    Boolean(currentFilters.query_date_attributes) ||
    hasActiveAttributes;

  const isPresetAttribute = (attr: AttributeItemType): boolean =>
    PRESET_ATTRIBUTE_TYPES.includes(attr.type) &&
    Boolean(attr.presets) &&
    (attr.presets ?? []).length > 0;

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          {t("lamina-log:filter.button", "Filter")}
          {hasActiveFilters && (
            <Badge className="ml-2 h-4 w-4 p-0 text-xs" variant="secondary">
              !
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[500px] p-0 flex flex-col max-h-[80vh]"
      >
        <div className="p-4 border-b bg-background">
          <h2 className="font-semibold">
            {t("lamina-log:filter.title", "Filter Options")}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Combobox
            label={t("lamina-log:filter.timeframe", "Time Range")}
            options={timeframeOptions}
            placeholder={t(
              "lamina-log:filter.timeframePlaceholder",
              "Select time range...",
            )}
            value={timeframe}
            onSelect={(value) => handleTimeframeChange(value || "all")}
          />

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t("lamina-log:filter.startDate", "Start Date")}
            </Label>
            <DatePicker
              buttonClassName="w-full"
              className="w-full"
              id="laminaLogStartDate"
              placeholder={t("lamina-log:filter.startDate", "Start Date")}
              value={startDateValue}
              onChangeAction={(d) => setStartDate(toStartOfDayISO(d))}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t("lamina-log:filter.endDate", "End Date")}
            </Label>
            <DatePicker
              buttonClassName="w-full"
              className="w-full"
              id="laminaLogEndDate"
              placeholder={t("lamina-log:filter.endDate", "End Date")}
              value={endDateValue}
              onChangeAction={(d) => setEndDate(toEndOfDayISO(d))}
            />
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label className="text-sm font-medium">
              {t(
                "lamina-log:filter.dateAttributes.title",
                "Filter by Date Attributes",
              )}
            </Label>

            {isLoadingAttributes ? (
              <div className="text-sm text-muted-foreground">
                {t("common:loading", "Loading...")}
              </div>
            ) : dateAttributes.length > 0 ? (
              <div className="space-y-3">
                {dateAttributes.map((attribute) => (
                  <div key={attribute.id} className="space-y-2">
                    <Label className="text-sm font-medium">
                      {attribute.name}
                    </Label>

                    <Button
                      className="w-full"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleAddDateAttributeFilter(attribute.id)
                      }
                    >
                      {t("common:add", "Add Filter")}
                    </Button>

                    {selectedDateAttributes
                      .filter((f) => f.attribute_id === attribute.id)
                      .map((filter) => {
                        const originalIndex =
                          selectedDateAttributes.indexOf(filter);
                        return (
                          <div
                            key={originalIndex}
                            className="space-y-2 pl-2 border-l-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                Filter #{originalIndex + 1}
                              </span>
                              <Button
                                className="h-6 w-6 p-0"
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleRemoveDateAttributeFilter(
                                    originalIndex,
                                  )
                                }
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>

                            <div className="space-y-2">
                              <div>
                                <Label className="text-xs">
                                  {t(
                                    "lamina-log:filter.dateAttributes.startDate",
                                    "Start Date",
                                  )}
                                </Label>
                                <Collapsible>
                                  <CollapsibleTrigger className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground">
                                    <span className="flex items-center gap-2">
                                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                      {filter.start_date
                                        ? format(
                                            new Date(filter.start_date),
                                            "PPP",
                                          )
                                        : (
                                          <span className="text-muted-foreground">
                                            {t(
                                              "lamina-log:filter.pickDate",
                                              "Pick a date",
                                            )}
                                          </span>
                                        )}
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="mt-1 rounded-md border bg-background shadow-md">
                                    <Calendar
                                      initialFocus
                                      mode="single"
                                      selected={
                                        filter.start_date
                                          ? new Date(filter.start_date)
                                          : undefined
                                      }
                                      onSelect={(date) => {
                                        if (date) {
                                          handleUpdateDateAttributeFilter(
                                            originalIndex,
                                            "start_date",
                                            format(date, "yyyy-MM-dd"),
                                          );
                                        }
                                      }}
                                    />
                                  </CollapsibleContent>
                                </Collapsible>
                              </div>

                              <div>
                                <Label className="text-xs">
                                  {t(
                                    "lamina-log:filter.dateAttributes.endDate",
                                    "End Date",
                                  )}
                                </Label>
                                <Collapsible>
                                  <CollapsibleTrigger className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground">
                                    <span className="flex items-center gap-2">
                                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                      {filter.end_date
                                        ? format(
                                            new Date(filter.end_date),
                                            "PPP",
                                          )
                                        : (
                                          <span className="text-muted-foreground">
                                            {t(
                                              "lamina-log:filter.pickDate",
                                              "Pick a date",
                                            )}
                                          </span>
                                        )}
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="mt-1 rounded-md border bg-background shadow-md">
                                    <Calendar
                                      initialFocus
                                      mode="single"
                                      selected={
                                        filter.end_date
                                          ? new Date(filter.end_date)
                                          : undefined
                                      }
                                      onSelect={(date) => {
                                        if (date) {
                                          handleUpdateDateAttributeFilter(
                                            originalIndex,
                                            "end_date",
                                            format(date, "yyyy-MM-dd"),
                                          );
                                        }
                                      }}
                                    />
                                  </CollapsibleContent>
                                </Collapsible>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                {t(
                  "lamina-log:filter.noDateAttributes",
                  "No date attributes available",
                )}
              </div>
            )}
          </div>

          {selectableAttributes.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <Label className="text-sm font-medium">
                {t(
                  "lamina-log:filter.attributes.title",
                  "Filter by Attributes",
                )}
              </Label>
              <div className="space-y-3">
                {selectableAttributes.map((attr) => (
                  <div key={attr.id} className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      {attr.name}
                    </Label>
                    {isPresetAttribute(attr) ? (
                      <ScrollArea className="max-h-[150px]">
                        <div className="space-y-2">
                          {(attr.presets ?? []).map((preset) => (
                            <div
                              key={preset}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                checked={(attributeFilters[attr.id] ?? []).includes(
                                  preset,
                                )}
                                id={`lamina-${attr.id}-${preset}`}
                                onCheckedChange={(checked) =>
                                  handleToggleAttributeValue(
                                    attr.id,
                                    preset,
                                    checked as boolean,
                                  )
                                }
                              />
                              <Label
                                className="cursor-pointer text-sm"
                                htmlFor={`lamina-${attr.id}-${preset}`}
                              >
                                {preset}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <Input
                        placeholder={t(
                          "lamina-log:filter.attributes.placeholder",
                          "Enter value...",
                        )}
                        value={(attributeFilters[attr.id] ?? [])[0] ?? ""}
                        onChange={(event) =>
                          setAttributeFilters((prev) => ({
                            ...prev,
                            [attr.id]: event.target.value
                              ? [event.target.value]
                              : [],
                          }))
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="border-t bg-background p-4">
          <div className="flex justify-between">
            <Button variant="ghost" onClick={handleReset}>
              {t("common:reset", "Reset")}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                {t("common:cancel", "Cancel")}
              </Button>
              <Button onClick={handleApply}>
                {t("common:apply", "Apply")}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LaminaLogDateAttributeFilter;
