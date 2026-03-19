import React, { useEffect, useRef, useState } from "react";
import { BroadcastChannelKey, getInstanceUrl, IsDeveloperMode } from "../api";
import { Anchor, Center, Collapse, Container, Group, Image, Loader, Paper, Spoiler, Stack, Text } from "@mantine/core";
import type { Intent } from "../../lib/intent";

export interface PageProps {
	message?: string;
	intent?: Intent;
};

// @ts-ignore Will use later...
export const usePublicInstances = ({ intent }: { intent?: Intent }) => {
	const INSTANCES_URL = "https://raw.githubusercontent.com/deniz-blue/events-format/refs/heads/main/data/instances.json";
	const [data, setData] = useState<{
		instances: InstanceInfo[];
	} | null>(null);

	useEffect(() => {
		fetch(INSTANCES_URL)
			.then(res => res.json())
			.then(setData);
	}, []);

	return [
		...(data?.instances || []),
		...(IsDeveloperMode ? [
			{ url: "http://localhost:5173" },
			{ url: "web+evnt://" },
		] : []),

		// ...((intent?.type == "event" && intent?.at?.includes("community.lexicon.calendar.event")) ? [
		// 	{
		// 		url: "https://smokesignal.events",
		// 		name: "Smoke Signal",
		// 	} as InstanceInfo
		// ] : []),
	];
}

// This is not that great lmao
export const useCountdown = ({
	callback,
	target,
	deps,
}: {
	deps: React.DependencyList;
	target: Date;
	callback: () => void;
}) => {
	const [enabled, setEnabled] = useState(true);
	const timeoutRef = useRef<number | null>(null);
	const [count, setCount] = useState<number | null>(null);

	useEffect(() => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current);

		if (enabled) timeoutRef.current = setTimeout(() => {
			callback();
			setCount(0);
		}, target.getTime() - Date.now());

		const get = () => Math.round(Math.max(0, target.getTime() - Date.now()) / 1000);

		setCount(enabled ? get() : null);

		const interval = setInterval(() => {
			if (enabled) setCount(get());
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	}, [enabled, target.getTime(), ...deps]);

	const cancel = () => {
		setEnabled(false);
	};

	return {
		count,
		cancel,
	};
};

export const Page = ({
	message,
	intent,
}: PageProps) => {
	const [preferredInstanceUrl, setPreferredInstanceUrl] = useState<string | null>(getInstanceUrl());
	const publicInstances = usePublicInstances({ intent });

	const dateRef = useRef(new Date(Date.now() + 1000 * 5));
	const { cancel, count } = useCountdown({
		callback: () => {
			window.location.href = (preferredInstanceUrl || publicInstances[0]?.url || "#") + "?" + new URLSearchParams(intent);
		},
		target: dateRef.current,
		deps: [publicInstances],
	});

	useEffect(() => {
		new BroadcastChannel(BroadcastChannelKey).onmessage = () => {
			setPreferredInstanceUrl(getInstanceUrl());
		};
	}, []);

	return (
		<Container size="xs" my="md">
			<Stack align="center" w="100%">
				<Text ta="center" fw="bold">
					{message}
				</Text>

				{preferredInstanceUrl && (
					<Text ta="center" size="sm" color="gray">
						Your default application is set to <a href={preferredInstanceUrl}>
							{preferredInstanceUrl.startsWith("web+evnt://") ? "web+evnt" : new URL(preferredInstanceUrl).host}
						</a>.
					</Text>
				)}

				<Collapse expanded={count !== null}>
					{(count === 0) ? (
						<Text ta="start" c="yellow">
							Redirecting...
						</Text>
					) : (
						<Text ta="start" c="dimmed">
							Redirecting to first application in <Text c="yellow" fw="bold" inherit span>
								{count}
							</Text>... <Anchor style={{ cursor: "pointer" }} onClick={cancel}>Cancel</Anchor>
						</Text>
					)}
				</Collapse>

				<Stack gap={0} w="100%">
					<Stack w="100%">
						{publicInstances.map(instance => (
							<InstanceCard key={instance.url} instance={instance} intent={intent} />
						))}
						{publicInstances.length === 0 && (
							<Center w="100%">
								<Loader />
							</Center>
						)}
					</Stack>
				</Stack>

				<Stack
					align="start"
					w="100%"
				>
					<Spoiler
						showLabel="What's this?"
						hideLabel="Show less"
						styles={{ control: { fontSize: "var(--mantine-font-size-sm)" } }}
						onExpandedChange={expanded => expanded && cancel()}
						maxHeight={0}
						w="100%"
					>
						<Stack gap="xs" fz="sm" mb="md">
							<Text inherit>
								<Text span inherit fw="bold">Evnt</Text> is a new open format for describing events, and this page is a redirector that sends you to the appropriate application to view the event, based on your preferences.
							</Text>

							<Anchor
								href="https://evnt.directory"
								target="_blank"
								rel="noopener noreferrer"
								inherit
							>
								Learn more about Evnt ↗
							</Anchor>
						</Stack>
					</Spoiler>
				</Stack>
			</Stack>
		</Container>
	)
}

export interface InstanceInfo {
	url: string;
	name?: string;
	description?: string;
};

export const InstanceCard = ({
	instance,
	intent,
}: {
	instance: InstanceInfo;
	intent?: Intent;
}) => {
	const [iconLoaded, setIconLoaded] = useState(false);

	const isProtocol = instance.url.startsWith("web+evnt://");

	const name = isProtocol
		? "web+evnt"
		: (instance.name || new URL(instance.url).host);

	const label = isProtocol
		? `Protocol Handler`
		: new URL(instance.url).origin;

	return (
		<Anchor
			href={instance.url + "?" + new URLSearchParams(intent)}
			unstyled
			w="100%"
			c="unset"
			td="unset"
			style={{
				cursor: "pointer",
			}}
		>
			<Paper
				withBorder
				className="instance-card"
				shadow="sm"
				p="xs"
			>
				<Group wrap="nowrap" gap="xs">
					<Collapse expanded={!!iconLoaded} orientation="vertical">
						<Image
							src={`${instance.url.replace(/\/$/, "")}/favicon.ico`}
							alt={`${new URL(instance.url).host} favicon`}
							w={32}
							h={32}
							onLoad={() => setIconLoaded(true)}
							bdrs="50%"
						/>
					</Collapse>
					<Stack gap={0} flex="1">
						<Text>
							{name}
						</Text>
						<Text fz="xs" c="dimmed">
							{label}
						</Text>
					</Stack>
				</Group>
			</Paper>
		</Anchor>
	)
};
