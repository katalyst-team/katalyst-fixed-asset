.PHONY: run pre-pr

run:
	bun run dev

pre-pr:
	bun run lint && bun run build
