import * as github from "@actions/github";

export const indexhtml = () => {
	const redirector = "https://eventsl.ink";

	return (
		`<!DOCTYPE html>
            <script>
                window.location = "https://github.com/${github.context.repo.owner}/${github.context.repo.repo}";
            </script>
        </html>`
	);
};
