"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { CircleHelp, Link2, MapPin, Plus, Trash2, WandSparkles, X } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppModal } from "@/components/ui/AppModal";
import { AppSelect } from "@/components/ui/AppSelect";
import { AppTag } from "@/components/ui/AppTag";
import { AppTextarea } from "@/components/ui/AppTextarea";
import { AppTooltip } from "@/components/ui/AppTooltip";
import { DraftingCoach } from "./DraftingCoach";
import { PlaceAutocomplete, type PlaceResult } from "@/components/features/map";
import { RouteTracingService } from "@/lib/services/RouteTracingService";
import { VEHICLE_REGISTRY } from "@/lib/config/vehicles";
import { ToastService } from "@/lib/services/toastService";

interface ShareRouteModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (postData: Partial<Post>) => Promise<void>;
  editMode?: boolean;
  postToEdit?: Post;
}

interface RouteInput extends Omit<Route, "id"> {
  tempId: string;
}

interface DraftLink {
  url: string;
  text: string;
}

interface LocalUploadFile {
  uid: string;
  name: string;
  url: string;
  thumbUrl: string;
}

const QUICK_TAGS = ["commute", "budget", "safe", "rush-hour", "night", "shortcut"];

function createInitialRoute(order: number): RouteInput {
  return {
    tempId: `${Date.now()}-${order}`,
    text: "",
    links: [],
    order,
    vehicles: [],
    fare: 0,
    status: "unverified",
  };
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Failed to read image file."));
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

export function ShareRouteModal({
  open,
  onClose,
  onSubmit,
  editMode = false,
  postToEdit,
}: ShareRouteModalProps) {
  const [title, setTitle] = useState("");
  const [routes, setRoutes] = useState<RouteInput[]>([
    createInitialRoute(1),
  ]);
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [fileList, setFileList] = useState<LocalUploadFile[]>([]);
  const [loading, setLoading] = useState(false);

  // Geographic fields
  const [startLabel, setStartLabel] = useState("");
  const [startLat, setStartLat] = useState<number | undefined>(undefined);
  const [startLng, setStartLng] = useState<number | undefined>(undefined);
  const [endLabel, setEndLabel] = useState("");
  const [endLat, setEndLat] = useState<number | undefined>(undefined);
  const [endLng, setEndLng] = useState<number | undefined>(undefined);
  const [region, setRegion] = useState("");
  const tagsSet = useMemo(() => new Set(tags), [tags]);
  const availableQuickTags = useMemo(
    () => QUICK_TAGS.filter((quickTag) => !tagsSet.has(quickTag)),
    [tagsSet],
  );

  // Auto-computed from coordinates
  const geoComputed = useMemo(() => {
    if (startLat == null || startLng == null || endLat == null || endLng == null) return null;
    return RouteTracingService.trace(startLat, startLng, endLat, endLng);
  }, [startLat, startLng, endLat, endLng]);

  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkTargetRoute, setLinkTargetRoute] = useState<string | null>(null);
  const [draftLink, setDraftLink] = useState<DraftLink>({ url: "", text: "" });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (editMode && postToEdit) {
      setTitle(postToEdit.title);
      setRoutes(
        postToEdit.routes.map((route) => ({
          tempId: route.id,
          text: route.text,
          links: route.links,
          order: route.order,
          vehicles: route.vehicles,
          fare: route.fare,
          status: route.status,
        })),
      );
      setTags(postToEdit.tags);
      setFileList(
        postToEdit.images.map((src, index) => ({
          uid: `${postToEdit.id}-${index}`,
          name: `image-${index + 1}`,
          status: "done",
          url: src,
          thumbUrl: src,
        })),
      );
      setStartLabel("");
      setStartLat(postToEdit.startLat);
      setStartLng(postToEdit.startLng);
      setEndLabel("");
      setEndLat(postToEdit.endLat);
      setEndLng(postToEdit.endLng);
      setRegion(postToEdit.region ?? "");
      return;
    }

    setTitle("");
    setRoutes([createInitialRoute(1)]);
    setTags([]);
    setTagsInput("");
    setFileList([]);
    setStartLabel("");
    setStartLat(undefined);
    setStartLng(undefined);
    setEndLabel("");
    setEndLat(undefined);
    setEndLng(undefined);
    setRegion("");
  }, [open, editMode, postToEdit]);

  const draftState = useMemo(
    () => ({
      title,
      routes: routes.map((r) => ({
        text: r.text,
        vehicles: r.vehicles,
        fare: r.fare,
        links: r.links,
      })),
      images: fileList.map((f) => f.url).filter((url) => url.length > 0),
    }),
    [title, routes, fileList],
  );

  const vehicleOptions = useMemo(
    () =>
      Object.values(VEHICLE_REGISTRY).map((vehicle) => ({
        value: vehicle.key,
        label: (
          <span className="inline-flex items-center gap-2">
            <vehicle.icon size={14} aria-hidden="true" />
            {vehicle.label}
          </span>
        ),
      })),
    [],
  );

  function updateRoute(
    routeTempId: string,
    updater: (route: RouteInput) => RouteInput,
  ): void {
    setRoutes((prev) =>
      prev.map((route) => (route.tempId === routeTempId ? updater(route) : route)),
    );
  }

  function addRoute(): void {
    setRoutes((prev) => [...prev, createInitialRoute(prev.length + 1)]);
  }

  function removeRoute(routeTempId: string): void {
    setRoutes((prev) => {
      const filtered = prev.filter((route) => route.tempId !== routeTempId);
      return filtered.length > 0
        ? filtered.map((route, index) => ({ ...route, order: index + 1 }))
        : [createInitialRoute(1)];
    });
  }

  function addTagsFromInput(): void {
    const nextTags = tagsInput
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0)
      .filter((tag) => !tags.includes(tag));

    if (nextTags.length === 0) {
      return;
    }

    setTags((prev) => [...prev, ...nextTags]);
    setTagsInput("");
  }

  function removeTag(tag: string): void {
    setTags((prev) => prev.filter((entry) => entry !== tag));
  }

  function openAddLinkModal(routeTempId: string): void {
    setLinkTargetRoute(routeTempId);
    setDraftLink({ url: "", text: "" });
    setLinkModalOpen(true);
  }

  function addLinkToRoute(): void {
    if (!linkTargetRoute || !draftLink.url.trim() || !draftLink.text.trim()) {
      ToastService.error("Add both link text and URL.");
      return;
    }

    updateRoute(linkTargetRoute, (route) => ({
      ...route,
      links: [
        ...route.links,
        { text: draftLink.text.trim(), url: draftLink.url.trim() },
      ],
    }));

    setLinkModalOpen(false);
    setLinkTargetRoute(null);
    setDraftLink({ url: "", text: "" });
  }

  function removeLink(routeTempId: string, linkIndex: number): void {
    updateRoute(routeTempId, (route) => ({
      ...route,
      links: route.links.filter((_, index) => index !== linkIndex),
    }));
  }

  async function handleFiles(files: FileList | null): Promise<void> {
    if (!files || files.length === 0) {
      return;
    }

    const selected = Array.from(files);

    const validFiles: File[] = [];
    for (const file of selected) {
      if (!file.type.startsWith("image/")) {
        ToastService.error("Only image files are supported.");
        continue;
      }
      if (file.size / 1024 / 1024 > 5) {
        ToastService.error("Image must be smaller than 5MB.");
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      return;
    }

    try {
      setLoading(true);

      const uploaded = await Promise.all(
        validFiles.map(async (file) => {
          const dataUrl = await fileToDataUrl(file);
          return {
            uid: `${Date.now()}-${file.name}`,
            name: file.name,
            url: dataUrl,
            thumbUrl: dataUrl,
          } satisfies LocalUploadFile;
        }),
      );

      setFileList((prev) => [...prev, ...uploaded]);
    } catch {
      ToastService.error("Failed to read one or more images.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(): Promise<void> {
    if (!title.trim()) {
      ToastService.error("Please add a route title.");
      return;
    }

    const validRoutes = routes.filter((route) => route.text.trim().length > 0);
    if (validRoutes.length === 0) {
      ToastService.error("Please add at least one route segment.");
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        ...(editMode && postToEdit ? { id: postToEdit.id } : {}),
        title: title.trim(),
        routes: validRoutes.map((route, index) => ({
          id: editMode ? route.tempId : `${Date.now()}-${index}`,
          text: route.text,
          links: route.links,
          order: index + 1,
          vehicles: route.vehicles,
          fare: route.fare,
          status: route.status,
        })),
        images: fileList.map((file) => file.url).filter((value) => value.length > 0),
        tags,
        startLat,
        startLng,
        endLat,
        endLng,
        region: region.trim() || undefined,
        totalDistanceKm: geoComputed?.distanceKm,
        estimatedMins: geoComputed?.estimatedMins,
      });

      ToastService.success(
        editMode ? "Route updated successfully." : "Route posted successfully.",
      );
      onClose();
    } catch {
      ToastService.error(editMode ? "Failed to update route." : "Failed to post route.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AppModal
        open={open}
        onClose={onClose}
        size="lg"
        title={editMode ? "Edit route" : "Share a route"}
        subtitle="Build a clear, trusted route report"
        footer={null}
      >
        <div className="space-y-4">
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border-light)] bg-[var(--color-bg-elevated)] px-3 py-2.5 text-xs text-[var(--color-text-secondary)]">
            <p className="inline-flex items-center gap-1 font-medium text-[var(--color-text-primary)]">
              <WandSparkles size={13} aria-hidden="true" />
              Quick route authoring guide
            </p>
            <p className="mt-1">
              Keep each segment short and actionable, then add map points and links for better route quality.
            </p>
          </div>

          <DraftingCoach draft={draftState} className="mb-2" />

          <AppInput
            placeholder="Give your route a clear title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={100}
          />

          {/* Geographic fields */}
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-3 space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide flex items-center gap-1">
                <MapPin size={12} aria-hidden="true" />
                Route coordinates (optional)
              </p>
              <AppTooltip title="Adding start/end points unlocks map previews and auto distance estimates.">
                <span className="inline-flex text-[var(--color-text-muted)]">
                  <CircleHelp size={13} aria-hidden="true" />
                </span>
              </AppTooltip>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <PlaceAutocomplete
                placeholder="Start location"
                value={startLabel}
                onChange={setStartLabel}
                onPlaceSelect={(place: PlaceResult) => {
                  setStartLabel(place.label);
                  setStartLat(place.lat);
                  setStartLng(place.lng);
                }}
              />
              <PlaceAutocomplete
                placeholder="End / destination"
                value={endLabel}
                onChange={setEndLabel}
                onPlaceSelect={(place: PlaceResult) => {
                  setEndLabel(place.label);
                  setEndLat(place.lat);
                  setEndLng(place.lng);
                }}
              />
            </div>
            <AppInput
              placeholder="Region / area (e.g. Lagos Mainland)"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              maxLength={60}
            />
            {geoComputed && (
              <p className="text-xs text-[var(--color-text-secondary)]">
                Distance: <strong>{geoComputed.distanceKm} km</strong> · Est. time:{" "}
                <strong>~{geoComputed.estimatedMins} min</strong>
              </p>
            )}
          </div>

          <div className="max-h-[48vh] space-y-3 overflow-y-auto pr-1">
            {routes.map((route, index) => (
              <div
                key={route.tempId}
                className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                    Segment {index + 1}
                  </span>

                  <div className="flex items-center gap-2">
                    <AppButton
                      variant="ghost"
                      size="sm"
                      icon={Link2}
                      onClick={() => openAddLinkModal(route.tempId)}
                    >
                      Link
                    </AppButton>

                    <AppTooltip title="Remove this segment">
                      <span className="inline-flex">
                        <AppButton
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => removeRoute(route.tempId)}
                          ariaLabel={`Remove segment ${index + 1}`}
                        />
                      </span>
                    </AppTooltip>
                  </div>
                </div>

                <div className="space-y-2">
                  <AppTextarea
                    placeholder={index === 0 ? "Where does the trip start?" : "Where next?"}
                    value={route.text}
                    onChange={(event) => {
                      const value = event.target.value;
                      updateRoute(route.tempId, (prev) => ({ ...prev, text: value }));
                    }}
                    autoSize={{ minRows: 2, maxRows: 6 }}
                    maxLength={index === 0 ? 300 : 220}
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <AppSelect<VehicleType[]>
                      mode="multiple"
                      value={route.vehicles}
                      options={vehicleOptions}
                      placeholder="Transport mode"
                      onChange={(value) => {
                        updateRoute(route.tempId, (prev) => ({
                          ...prev,
                          vehicles: value as VehicleType[],
                        }));
                      }}
                      className="min-w-[220px]"
                    />

                    <AppInput
                      type="number"
                      min={0}
                      value={route.fare}
                      onChange={(event) => {
                        const fare = Number(event.target.value || 0);
                        updateRoute(route.tempId, (prev) => ({
                          ...prev,
                          fare: Number.isNaN(fare) ? 0 : fare,
                        }));
                      }}
                      placeholder="Fare (NGN)"
                      className="w-[160px]"
                    />
                  </div>

                  {route.links.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {route.links.map((link, linkIndex) => (
                        <AppTag
                          key={`${route.tempId}-${link.url}-${linkIndex}`}
                          label={link.text}
                          icon={Link2}
                          variant="info"
                          size="sm"
                          removable
                          onRemove={() => removeLink(route.tempId, linkIndex)}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <AppButton variant="secondary" icon={Plus} onClick={addRoute}>
            Add another segment
          </AppButton>

          <div className="space-y-2">
            <div className="flex gap-2">
              <AppInput
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                onPressEnter={addTagsFromInput}
                placeholder="Add tags separated by commas"
              />
              <AppButton variant="secondary" onClick={addTagsFromInput}>
                Add tags
              </AppButton>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableQuickTags.map((quickTag) => (
                <AppTag
                  key={quickTag}
                  label={`#${quickTag}`}
                  variant="default"
                  size="xs"
                  onClick={() => setTags((prev) => [...prev, quickTag])}
                  aria-label={`Add ${quickTag} tag`}
                />
              ))}
            </div>

            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <AppTag
                    key={tag}
                    label={`#${tag}`}
                    variant="primary"
                    size="sm"
                    removable
                    onRemove={() => removeTag(tag)}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <input
              id="share-route-images"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              aria-label="Upload route images"
              title="Upload route images"
              onChange={(e) => void handleFiles(e.target.files)}
            />

            <div className="flex items-center gap-3">
              <label htmlFor="share-route-images" className="cursor-pointer">
                <AppTooltip title="Add photos for landmarks, bus stops, or route checkpoints.">
                  <span className="inline-flex">
                    <AppButton variant="ghost" icon={Plus}>
                      Upload images
                    </AppButton>
                  </span>
                </AppTooltip>
              </label>

              {fileList.length > 0 ? (
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {fileList.length} selected
                </span>
              ) : null}
            </div>

            {fileList.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {fileList.map((file) => {
                  const src = file.thumbUrl || file.url;
                  if (!src) return null;

                  return (
                    <div
                      key={file.uid}
                      className="relative overflow-hidden rounded-md border border-[var(--color-border)]"
                    >
                      <div className="relative aspect-square w-full">
                        <Image
                          src={src}
                          alt={file.name}
                          fill
                          sizes="160px"
                          className="object-cover"
                        />
                      </div>

                      <AppButton
                        variant="icon"
                        icon={X}
                        ariaLabel={`Remove ${file.name}`}
                        className="!absolute !right-1 !top-1 !bg-white/85"
                        onClick={() => {
                          setFileList((prev) =>
                            prev.filter((entry) => entry.uid !== file.uid),
                          );
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-[var(--color-border)] pt-3">
            <AppButton variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </AppButton>

            <AppButton onClick={() => void handleSubmit()} loading={loading}>
              {editMode ? "Update route" : "Post route"}
            </AppButton>
          </div>
        </div>
      </AppModal>

      <AppModal
        open={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        title="Add route link"
        footer={
          <div className="flex justify-end gap-2">
            <AppButton variant="ghost" onClick={() => setLinkModalOpen(false)}>
              Cancel
            </AppButton>
            <AppButton onClick={addLinkToRoute}>Add link</AppButton>
          </div>
        }
      >
        <div className="space-y-3">
          <AppInput
            value={draftLink.url}
            onChange={(event) =>
              setDraftLink((prev) => ({ ...prev, url: event.target.value }))
            }
            placeholder="https://example.com"
          />

          <AppInput
            value={draftLink.text}
            onChange={(event) =>
              setDraftLink((prev) => ({ ...prev, text: event.target.value }))
            }
            placeholder="Link label"
          />
        </div>
      </AppModal>
    </>
  );
}
