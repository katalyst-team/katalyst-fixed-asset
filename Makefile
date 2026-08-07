.PHONY: dev pre-pr

dev:
	bun run dev

pre-pr:
	bun run lint && bun run build
