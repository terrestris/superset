from playwright.sync_api import expect
from conftest import (
    open_dahboard,
    hover_canvas_until_tooltip
    )


TEST_DASHBOARD = 'Test FILTER JS'
TEST_DASHBOARD_THEM_MAP = "Test Leipzig Baumarten"


def test_them_map_filter(page):
    open_dahboard(page, TEST_DASHBOARD_THEM_MAP)

    expect(page.locator('span[aria-label="filter"]')).to_be_visible()
    page.locator('span[aria-label="filter"]').click()
    page.wait_for_load_state('networkidle')

    charts = ['Baumarten 1',
              'Baumarten 2',
              'Baumarten 3']
    for chart in charts:
        locator = page.locator(f'div[data-test-chart-name="{chart}"]')
        expect(locator).to_be_visible(timeout=30000)

    expect(page.locator('#chart-id-1317')).to_be_visible(timeout=50000)
    expect(page.locator('#chart-id-1317').first).to_have_class('thematic_map')

    # set filter
    hover_canvas_until_tooltip(page, '#chart-id-1317')
    expect(page.locator('#infoTooltip')).to_be_visible()
    expect(page.locator(
        '#infoTooltip strong:has-text("geom")'
        )).to_be_visible()
    page.wait_for_load_state('networkidle')
    expect(page.locator('span.css-19ez2t:has-text("geom")')).to_be_visible()
    expect(page.get_by_role('alert')).not_to_be_visible()

    for chart in charts:
        expect(
            page.locator((
                f'div[data-test-chart-name="{chart}"] '
                'div[aria-label="Applied filters (1)"]')
            )).to_be_visible()

    # set second filter in piechart
    page.locator('#chart-id-127 canvas').first.click(
        button="left", modifiers=["Shift"], position={"x": 100, "y": 150}
    )
    page.wait_for_load_state('networkidle')
    expect(page.locator('span.css-19ez2t:has-text("gattung")')).to_be_visible()
    expect(page.get_by_role('alert')).not_to_be_visible()
    page.wait_for_timeout(10000)

    expect(
            page.locator((
                'div[data-test-chart-name="Baumarten 2"] '
                'div[aria-label="Applied filters (2)"]')
            )).to_be_visible()

    applied_filters = page.locator((
                'div[data-test-chart-name="Baumarten 2"] '
                'div[aria-label="Applied filters (2)"]'
            ))
    applied_filters.scroll_into_view_if_needed()
    expect(applied_filters).to_be_visible()

    # remove filter
    page.locator(
        'div.ant-collapse-content span.anticon-close'
        ).first.click()

    expect(
        page.locator('span.css-19ez2t:has-text("geom")')
        ).not_to_be_visible()
