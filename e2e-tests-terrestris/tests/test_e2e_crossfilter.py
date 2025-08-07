from playwright.sync_api import expect
from conftest import (
    open_dahboard
    )


TEST_DASCHBOARD = 'Test FILTER JS'


def test_open_dahboard(page):
    open_dahboard(page, TEST_DASCHBOARD)

    charts = ['Test POINT Cartodiagram JS',
              'TEST PIE JS',
              'JS Knoten Carto',
              'Test_Knoten',
              'JS Knoten',
              'Test BRW Zonen']
    for chart in charts:
        expect(page.locator(
            'div[data-test-chart-name="' + chart + '"]'
            )).to_be_visible()


def test_filtermenu(page):
    open_dahboard(page, TEST_DASCHBOARD)

    expect(page.locator('span[aria-label="filter"]')).to_be_visible()
    page.locator('span[aria-label="filter"]').click()
    page.wait_for_load_state('networkidle')
    expect(page.locator('p.ant-empty-description')).to_be_visible()
    page.locator('span[aria-label="expand"]').click()
    page.wait_for_load_state('networkidle')
    expect(page.locator('p.ant-empty-description')).not_to_be_visible()


def test_crossfilter(page):
    open_dahboard(page, TEST_DASCHBOARD)

    expect(page.locator('span[aria-label="filter"]')).to_be_visible()
    page.locator('span[aria-label="filter"]').click()
    page.wait_for_load_state('networkidle')
    page.locator('#chart-id-1314').first.wait_for(state='visible')

    carto_canvas_count = page.locator(
        '#chart-id-1314 canvas'
        ).count()

    # set filter
    page.locator('#chart-id-325 canvas').first.click(
        button="left", modifiers=["Shift"], position={"x": 100, "y": 150}
    )
    page.wait_for_load_state('networkidle')
    expect(page.locator('span.css-19ez2t:has-text("cat")')).to_be_visible()
    expect(page.get_by_role('alert')).not_to_be_visible()

    carto_canvas_count_filtered = page.locator(
        '#chart-id-1314 canvas'
        ).count()
    assert carto_canvas_count_filtered < carto_canvas_count, (
        f'Expected fewer canvas elements in Cartodiagram after filtering, '
        f'got {carto_canvas_count_filtered} of {carto_canvas_count}'
    )

    page.locator('#chart-id-248').first.wait_for(state='visible')
    second_carto_canvas_count = page.locator(
        '#chart-id-248 canvas'
        ).count()

    assert second_carto_canvas_count > 10, (
        f'Expect more than 10 canvas elements in second Cartodiagram chart, '
        f'got {second_carto_canvas_count}'
    )

    page.locator((
        'div[data-test-chart-name="Test POINT Cartodiagram JS"] '
        'span[aria-label="More Options"]'
        )).click()
    expect(page.get_by_role("button", name="View as table")).to_be_visible()
    page.get_by_role("button", name="View as table").click()
    page.wait_for_load_state('networkidle')
    expect(page.locator('.antd5-modal-root .table-condensed')).to_be_visible()
    table_count = page.locator(
        '.antd5-modal-root .table-condensed tbody tr'
        ).count()
    assert table_count == 1, (
        f'Expect 1 row in table after filering, got {table_count}'
        )
    page.locator('button[aria-label="Close"]').nth(1).click()
    page.wait_for_load_state('networkidle')

    page.locator((
        'div[data-test-chart-name="Test POINT Cartodiagram JS"] '
        'span[aria-label="More Options"]'
        )).click()
    expect(page.get_by_role("button", name="View query")).to_be_visible()
    page.get_by_role("button", name="View query").click()
    page.wait_for_load_state('networkidle')
    expect(page.get_by_text('SELECT').first).to_be_visible()
    expect(page.get_by_text('WHERE')).to_be_visible()

    page.locator('button[aria-label="Close"]').nth(1).click()
    page.wait_for_load_state('networkidle')

    # remove filter
    page.locator('#chart-id-325 canvas').first.click(
        button="right", modifiers=["Shift"], position={"x": 134, "y": 300}
    )
    page.get_by_text('Remove cross-filter').click()
    page.wait_for_load_state('networkidle')
    expect(page.locator('span.css-19ez2t:has-text("cat")')).not_to_be_visible()

    # set second filter
    page.locator('#chart-id-206 canvas').first.click(
        button="left", modifiers=["Shift"], position={"x": 100, "y": 150}
    )
    page.wait_for_load_state('networkidle')
    expect(
        page.locator('span.css-19ez2t:has-text("objectid")')
        ).to_be_visible()
    charts = [
        'JS Knoten Carto',
        'JS Knoten',
        'Test BRW Zonen'
    ]
    for chart in charts:
        expect(
            page.locator((
                'div[data-test-chart-name="' + chart + '"] '
                'div[aria-label="Applied filters (1)"]')
            )).to_be_visible()

    expect(page.get_by_role('alert')).not_to_be_visible()

    # set additional filter in cartodiagram
    page.locator('#chart-id-1314 canvas').nth(1).click(
        button="left", modifiers=["Shift"], position={"x": 48, "y": 45}
    )

    expect(page.get_by_role('alert')).not_to_be_visible()

    page.locator((
        'div[data-test-chart-name="TEST PIE JS"] '
        'span[aria-label="More Options"]'
        )).click()
    expect(page.get_by_role("button", name="View as table")).to_be_visible()
    page.get_by_role("button", name="View as table").click()
    page.wait_for_load_state('networkidle')
    expect(page.locator('.antd5-modal-root .table-condensed')).to_be_visible()
    table_count = page.locator(
        '.antd5-modal-root .table-condensed tbody tr'
        ).count()
    assert table_count == 1, (
        f'Expect 1 row in table after filering, got {table_count}'
        )
    page.locator('button[aria-label="Close"]').nth(1).click()
    page.wait_for_load_state('networkidle')

    page.locator(
        'div.ant-collapse-content span.anticon-close'
        ).nth(1).click()

    expect(
        page.locator('span.css-19ez2t:has-text("objectid")')
        ).not_to_be_visible()
